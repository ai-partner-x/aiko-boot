/**
 * @ai-partner-x/aiko-boot-starter-mq
 *
 * MQ 模块，Spring Boot 风格的消息队列
 * 支持 RabbitMQ，可扩展 Kafka / Redis
 */

// Config
export type { MqProperties } from './config/MqProperties.js';
export { loadMqProperties } from './config/MqProperties.js';
export { MqAutoConfiguration } from './config/MqAutoConfiguration.js';
export type { MqAdapter } from './config/MqAutoConfiguration.js';

// Decorators
export { MqListener, getMqListenerMetadata } from './decorators/MqListener.js';
export type { MqListenerOptions } from './decorators/MqListener.js';
export { MqHandler, getMqHandlerMethods } from './decorators/MqHandler.js';
export { Payload, getPayloadIndex } from './decorators/Payload.js';

// Producer
export { MqTemplate } from './producer/MqTemplate.js';
export type { MqProducer } from './producer/interfaces.js';

// Consumer
export type { MessageListener } from './consumer/MessageListener.js';
export { ConsumerContainer } from './consumer/ConsumerContainer.js';

// Adapters
export { RabbitMqAdapter } from './adapters/RabbitMqAdapter.js';
export { InMemoryMqAdapter } from './adapters/InMemoryMqAdapter.js';
export type { MqMessage, MqConsumeOptions } from './adapters/RabbitMqAdapter.js';

// Logger
export { logger } from './logger.js';
