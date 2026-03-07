/**
 * @MqListener 消费者类装饰器
 * 标记监听指定队列的消费者类
 */

import 'reflect-metadata';

const MQ_LISTENER_METADATA = Symbol('mq:listener');

export interface MqListenerOptions {
  queue: string;
  retry?: number;
  dlq?: string;
}

export function MqListener(options: MqListenerOptions): ClassDecorator {
  return (target) => {
    Reflect.defineMetadata(MQ_LISTENER_METADATA, options, target);
  };
}

export function getMqListenerMetadata(target: new (...args: unknown[]) => unknown): MqListenerOptions | undefined {
  return Reflect.getMetadata(MQ_LISTENER_METADATA, target);
}
