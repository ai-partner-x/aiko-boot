/**
 * RabbitMQ 适配器
 * 基于 amqplib，支持发送、消费、DLQ、重试
 */

import { connect } from 'amqplib';
import { v4 as uuidv4 } from 'uuid';
import type { MqProperties } from '../config/MqProperties.js';
import { logger } from '../logger.js';

export interface MqMessage<T = unknown> {
  id: string;
  timestamp: number;
  traceId?: string;
  payload: T;
  retryCount: number;
  maxRetries: number;
}

export interface MqConsumeOptions {
  retry?: number;
  dlq?: string;
}

/** amqplib 连接与通道类型（从 connect 返回值推导，兼容库的类型定义） */
type AmqpConnection = Awaited<ReturnType<typeof connect>>;
type AmqpChannel = Awaited<ReturnType<AmqpConnection['createChannel']>>;

export class RabbitMqAdapter {
  private conn: AmqpConnection | null = null;
  private channel: AmqpChannel | null = null;
  private readonly properties: MqProperties;

  constructor(properties: MqProperties) {
    this.properties = properties;
  }

  async connect(): Promise<void> {
    if (this.conn) return;
    const { host, port = 5672, username, password, vhost = '/', connectionTimeout = 10000 } = this.properties;
    const vhostPath = vhost.startsWith('/') ? vhost : `/${vhost}`;
    const url = `amqp://${encodeURIComponent(username)}:${encodeURIComponent(password)}@${host}:${port}${vhostPath}`;

    try {
      this.conn = await connect(url, { timeout: connectionTimeout });
      this.channel = await this.conn.createChannel();
      logger.info('RabbitMQ connected successfully');

      this.conn.on('close', () => {
        logger.warn('RabbitMQ connection closed');
        this.conn = null;
        this.channel = null;
      });
    } catch (err) {
      logger.error('RabbitMQ connection failed', err);
      throw err;
    }
  }

  async send<T>(queue: string, payload: T, traceId?: string): Promise<void> {
    if (!this.channel) throw new Error('Channel not initialized');
    const msg: MqMessage<T> = {
      id: uuidv4(),
      timestamp: Date.now(),
      traceId: traceId ?? uuidv4(),
      payload,
      retryCount: 0,
      maxRetries: this.properties.defaultRetryCount ?? 3,
    };

    await this.channel.assertQueue(queue, { durable: true });
    this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(msg)), { persistent: true });
    logger.debug(`Sent to ${queue}`, { traceId: msg.traceId });
  }

  async consume<T>(
    queue: string,
    handler: (msg: MqMessage<T>) => Promise<void>,
    options: MqConsumeOptions = {}
  ): Promise<void> {
    if (!this.channel) return;
    const retry = options.retry ?? this.properties.defaultRetryCount ?? 3;
    const dlq = options.dlq ?? `${queue}.dlq`;

    await this.channel.assertQueue(queue, { durable: true });
    if (this.properties.enableDLQ) {
      await this.channel.assertQueue(dlq, { durable: true });
    }

    this.channel.consume(queue, async (raw) => {
      if (!raw) return;
      const traceId = (raw.properties.headers?.traceId as string) ?? uuidv4();

      try {
        const mqMsg: MqMessage<T> = JSON.parse(raw.content.toString());
        logger.debug(`Consuming from ${queue}`, { traceId, retry: mqMsg.retryCount });

        await handler(mqMsg);
        this.channel!.ack(raw);
        logger.debug(`ACK ${queue}`, { traceId });
      } catch (err) {
        const mqMsg: MqMessage<T> = JSON.parse(raw.content.toString());
        mqMsg.retryCount += 1;

        if (mqMsg.retryCount >= (mqMsg.maxRetries ?? retry)) {
          logger.error(`Max retries reached, moving to DLQ: ${dlq}`, { traceId, err });
          this.channel!.nack(raw, false, false);
          if (this.properties.enableDLQ) {
            this.channel!.sendToQueue(dlq, Buffer.from(JSON.stringify(mqMsg)), { persistent: true });
          }
        } else {
          logger.warn(`Retrying (${mqMsg.retryCount}/${mqMsg.maxRetries})`, { traceId });
          this.channel!.nack(raw, false, true);
        }
      }
    });
  }

  async close(): Promise<void> {
    const ch = this.channel;
    const c = this.conn;
    this.channel = null;
    this.conn = null;
    if (ch) await ch.close();
    if (c) await c.close();
    logger.info('RabbitMQ connection closed');
  }
}
