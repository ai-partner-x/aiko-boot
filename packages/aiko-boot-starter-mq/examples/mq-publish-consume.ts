/**
 * MQ Example - 发布 & 消费示例
 *
 * 展示 @ai-partner-x/aiko-boot-starter-mq 的基本用法：
 * 1. 定义消费者（@MqListener + @MqHandler + @Payload）
 * 2. 注册到 ConsumerContainer
 * 3. 通过 MqAutoConfiguration 初始化 MQ
 * 4. 使用 MqTemplate 发送消息
 *
 * 运行前请确保本地已启动 RabbitMQ（默认连接 amqp://guest:guest@localhost:5672/）
 */

import 'reflect-metadata';
import {
  MqListener,
  MqHandler,
  Payload,
  ConsumerContainer,
  MqTemplate,
  MqAutoConfiguration,
} from '../src/index.js';

// ==================== 事件定义 ====================

export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}

// ==================== 消费者定义 ====================

class UserCreatedListener {
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    console.log('[Consumer] User created event received:', event);
  }
}

// 手动应用装饰器（避免依赖运行时对 TypeScript 装饰器语法的支持）
MqListener({
  queue: 'user.created',
  retry: 3,
  dlq: 'user.created.dlq',
})(UserCreatedListener);

MqHandler()(
  UserCreatedListener.prototype,
  'handleUserCreated',
  Object.getOwnPropertyDescriptor(UserCreatedListener.prototype, 'handleUserCreated')!,
);

Payload()(UserCreatedListener.prototype, 'handleUserCreated', 0);

// ==================== 示例主函数 ====================

async function main(): Promise<void> {
  console.log('=== @ai-partner-x/aiko-boot-starter-mq Publish & Consume Example ===\n');

  // 1. 注册消费者到容器
  ConsumerContainer.registerListener(UserCreatedListener);

  // 2. 初始化 MQ（根据环境变量加载配置）
  // 默认：rabbitmq + localhost:5672 + guest/guest
  await MqAutoConfiguration.init();

  // 3. 创建发送模板
  const mqTemplate = new MqTemplate();

  // 4. 发送一条用户创建事件
  console.log('--- PUBLISH ---');
  const payload: UserCreatedEvent = {
    userId: 'u-' + Date.now(),
    email: 'user@example.com',
    name: 'Alice',
  };
  await mqTemplate.send('user.created', payload);
  console.log('Message published:', payload);
  console.log('');

  // 5. 等待一小段时间，确保消费者有机会处理消息
  console.log('Waiting for consumer to handle message...\n');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // 6. 关闭连接（可选）
  const adapter = MqAutoConfiguration.getAdapter();
  await adapter.close();

  console.log('\n=== Example Complete ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

