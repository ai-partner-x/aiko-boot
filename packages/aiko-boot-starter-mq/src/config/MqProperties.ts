/**
 * MQ 配置属性
 * 支持从环境变量加载，风格对齐 Spring Boot application.yml
 */

export interface MqProperties {
  type: 'rabbitmq' | 'kafka' | 'redis' | 'memory';
  host: string;
  port?: number;
  username: string;
  password: string;
  vhost?: string;
  connectionTimeout?: number;
  defaultRetryCount?: number;
  enableDLQ?: boolean;
}

export function loadMqProperties(): MqProperties {
  return {
    type: (process.env.MQ_TYPE as MqProperties['type']) || 'rabbitmq',
    host: process.env.MQ_HOST || 'localhost',
    port: parseInt(process.env.MQ_PORT || '5672', 10),
    username: process.env.MQ_USERNAME || 'guest',
    password: process.env.MQ_PASSWORD || 'guest',
    vhost: process.env.MQ_VHOST || '/',
    connectionTimeout: 10000,
    defaultRetryCount: 3,
    enableDLQ: true,
  };
}
