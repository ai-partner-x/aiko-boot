/**
 * MqTemplate - 消息发送模板
 * 对齐 Spring Boot RabbitTemplate 风格
 */

import { MqAutoConfiguration } from '../config/MqAutoConfiguration.js';
import type { MqProducer } from './interfaces.js';

export class MqTemplate implements MqProducer {
  private getAdapter() {
    return MqAutoConfiguration.getAdapter();
  }

  async send<T>(queue: string, payload: T, traceId?: string): Promise<void> {
    return this.getAdapter().send(queue, payload, traceId);
  }
}
