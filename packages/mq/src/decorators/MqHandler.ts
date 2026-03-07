/**
 * @MqHandler 消息处理方法装饰器
 * 标记消费者类中处理消息的方法
 */

import 'reflect-metadata';

const MQ_HANDLER_METADATA = Symbol('mq:handler');

export function MqHandler(): MethodDecorator {
  return (target, propertyKey) => {
    Reflect.defineMetadata(MQ_HANDLER_METADATA, true, target, propertyKey);
  };
}

export function getMqHandlerMethods(target: new (...args: unknown[]) => unknown): string[] {
  const proto = target.prototype;
  return Object.getOwnPropertyNames(proto).filter((method) =>
    Reflect.getMetadata(MQ_HANDLER_METADATA, proto, method)
  );
}
