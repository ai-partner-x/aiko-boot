/**
 * ConsumerContainer - 消费者容器
 * 自动扫描 @MqListener 类并向适配器注册
 */

import { getMqListenerMetadata } from '../decorators/MqListener.js';
import { getMqHandlerMethods } from '../decorators/MqHandler.js';
import { getPayloadIndex } from '../decorators/Payload.js';
import { logger } from '../logger.js';

export interface MqConsumeAdapter {
  consume<T>(
    queue: string,
    handler: (msg: { payload: T }) => Promise<void>,
    options: { retry?: number; dlq?: string }
  ): Promise<void>;
}

export class ConsumerContainer {
  private static listeners: (new (...args: unknown[]) => unknown)[] = [];

  static registerListener(listener: new (...args: unknown[]) => unknown): void {
    this.listeners.push(listener);
  }

  /** 清空已注册的监听器（仅用于测试） */
  static clearListenersForTesting(): void {
    this.listeners = [];
  }

  static async registerAll(adapter: MqConsumeAdapter): Promise<void> {
    for (const ListenerClass of this.listeners) {
      const options = getMqListenerMetadata(ListenerClass);
      if (!options) continue;

      const handlerMethods = getMqHandlerMethods(ListenerClass);
      if (handlerMethods.length === 0) {
        logger.warn(`No @MqHandler found in ${ListenerClass.name}`);
        continue;
      }

      const instance = new ListenerClass() as Record<string, (...args: unknown[]) => Promise<unknown>>;
      const method = handlerMethods[0];
      const payloadIndex = getPayloadIndex(ListenerClass.prototype, method);
      const methodFn = instance[method];
      if (typeof methodFn !== 'function') continue;

      const paramLength = methodFn.length;
      await adapter.consume(
        options.queue,
        async (msg: { payload: unknown }) => {
          const args: unknown[] = new Array(paramLength).fill(undefined);
          if (payloadIndex !== undefined) {
            args[payloadIndex] = msg.payload;
          }
          await instance[method](...args);
        },
        { retry: options.retry, dlq: options.dlq }
      );

      logger.info(`Registered listener for queue: ${options.queue}`);
    }
  }
}
