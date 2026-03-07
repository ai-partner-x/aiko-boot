/**
 * MQ 自动配置
 * 根据配置类型创建适配器并注册消费者，对齐 Spring Boot AutoConfiguration
 */

import type { MqProperties } from './MqProperties.js';
import { loadMqProperties } from './MqProperties.js';
import { RabbitMqAdapter } from '../adapters/RabbitMqAdapter.js';
import { ConsumerContainer } from '../consumer/ConsumerContainer.js';
import { logger } from '../logger.js';

export type MqAdapter = InstanceType<typeof RabbitMqAdapter>;

export class MqAutoConfiguration {
  private static adapter: MqAdapter | null = null;
  private static properties: MqProperties | null = null;
  private static initialized = false;

  static async init(): Promise<void> {
    if (this.initialized) return;
    this.properties = loadMqProperties();

    switch (this.properties.type) {
      case 'rabbitmq':
        this.adapter = new RabbitMqAdapter(this.properties);
        break;
      case 'kafka':
        throw new Error('Kafka adapter not implemented');
      case 'redis':
        throw new Error('Redis MQ adapter not implemented');
      default:
        throw new Error(`Unsupported MQ type: ${this.properties.type}`);
    }

    await this.adapter.connect();
    await ConsumerContainer.registerAll(this.adapter);
    this.initialized = true;
    logger.info('MQ starter initialized successfully');
  }

  static getAdapter(): MqAdapter {
    if (!this.initialized || !this.adapter) {
      throw new Error('MQ not initialized. Call MqAutoConfiguration.init() first.');
    }
    return this.adapter;
  }
}
