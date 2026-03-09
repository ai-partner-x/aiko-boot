/**
 * InMemoryMqAdapter - 内存消息队列适配器
 * 用于单元测试，无需 RabbitMQ
 */

import { v4 as uuidv4 } from 'uuid';
import type { MqProperties } from '../config/MqProperties.js';
import type { MqMessage, MqConsumeOptions } from './RabbitMqAdapter.js';

export class InMemoryMqAdapter {
  private readonly queues = new Map<string, Array<{ raw: Buffer; resolve: () => void }>>();
  private readonly consumers = new Map<string, (msg: MqMessage<unknown>) => Promise<void>>();

  constructor(_properties: MqProperties) {
    // 内存适配器不依赖配置
  }

  async connect(): Promise<void> {
    // 内存适配器无需建立连接
  }

  async send<T>(queue: string, payload: T, traceId?: string): Promise<void> {
    const msg: MqMessage<T> = {
      id: uuidv4(),
      timestamp: Date.now(),
      traceId: traceId ?? uuidv4(),
      payload,
      retryCount: 0,
      maxRetries: 3,
    };
    const consumer = this.consumers.get(queue);
    if (consumer) {
      await consumer(msg as MqMessage<unknown>);
    } else {
      const list = this.queues.get(queue) ?? [];
      list.push({ raw: Buffer.from(JSON.stringify(msg)), resolve: () => {} });
      this.queues.set(queue, list);
    }
  }

  async consume<T>(
    queue: string,
    handler: (msg: MqMessage<T>) => Promise<void>,
    _options: MqConsumeOptions = {}
  ): Promise<void> {
    this.consumers.set(queue, handler as (msg: MqMessage<unknown>) => Promise<void>);
    // 处理已排队未消费的消息
    const list = this.queues.get(queue);
    if (list?.length) {
      for (const entry of list) {
        try {
          const mqMsg = JSON.parse(entry.raw.toString()) as MqMessage<T>;
          await handler(mqMsg);
        } finally {
          entry.resolve();
        }
      }
      this.queues.set(queue, []);
    }
  }

  async close(): Promise<void> {
    this.queues.clear();
    this.consumers.clear();
  }
}
