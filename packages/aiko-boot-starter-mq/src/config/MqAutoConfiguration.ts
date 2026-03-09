/**
 * MQ 自动配置
 * 集成 aiko-boot 框架的 AutoConfiguration 机制
 * 
 * - 使用 createApp() 时由框架自动发现并加载
 * - 非 createApp 场景（如 Next.js）可手动调用 init()
 */

import 'reflect-metadata';
import type { MqProperties } from './MqProperties.js';
import { loadMqProperties } from './MqProperties.js';
import { RabbitMqAdapter } from '../adapters/RabbitMqAdapter.js';
import { InMemoryMqAdapter } from '../adapters/InMemoryMqAdapter.js';
import { ConsumerContainer } from '../consumer/ConsumerContainer.js';
import { logger } from '../logger.js';
import {
  AutoConfiguration,
  ConditionalOnProperty,
  OnApplicationReady,
  OnApplicationShutdown,
} from '@ai-partner-x/aiko-boot/boot';

export type MqAdapter = InstanceType<typeof RabbitMqAdapter> | InstanceType<typeof InMemoryMqAdapter>;

@AutoConfiguration({ order: 150 })
@ConditionalOnProperty('mq.enabled', { matchIfMissing: true })
export class MqAutoConfiguration {
  private static adapter: MqAdapter | null = null;
  private static properties: MqProperties | null = null;
  private static initialized = false;

  /**
   * 应用就绪时自动初始化 MQ（由 createApp 触发）
   */
  @OnApplicationReady({ order: 100 })
  async autoInit(): Promise<void> {
    await MqAutoConfiguration.doInit();
  }

  /**
   * 应用关闭时断开 MQ 连接
   */
  @OnApplicationShutdown({ order: 100 })
  async shutdown(): Promise<void> {
    if (MqAutoConfiguration.adapter) {
      await MqAutoConfiguration.adapter.close();
      MqAutoConfiguration.adapter = null;
      MqAutoConfiguration.initialized = false;
      logger.info('MQ connection closed');
    }
  }

  /**
   * 执行初始化逻辑（供 autoInit 和手动 init 共用）
   */
  private static async doInit(): Promise<void> {
    if (this.initialized) return;
    this.properties = loadMqProperties();

    switch (this.properties.type) {
      case 'rabbitmq':
        this.adapter = new RabbitMqAdapter(this.properties);
        break;
      case 'memory':
        this.adapter = new InMemoryMqAdapter(this.properties);
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

  /**
   * 手动初始化（用于 Next.js、独立脚本等非 createApp 场景）
   */
  static async init(): Promise<void> {
    await this.doInit();
  }

  static getAdapter(): MqAdapter {
    if (!this.initialized || !this.adapter) {
      throw new Error('MQ not initialized. Call MqAutoConfiguration.init() first.');
    }
    return this.adapter;
  }

  /** 重置状态（仅用于测试） */
  static resetForTesting(): void {
    this.adapter = null;
    this.properties = null;
    this.initialized = false;
  }
}
