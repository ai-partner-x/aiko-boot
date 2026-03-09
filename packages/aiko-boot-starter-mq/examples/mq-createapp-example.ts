/**
 * MQ + createApp 示例 - 演示框架自动配置集成
 *
 * 使用 createApp() 时，MqAutoConfiguration 由框架自动发现并加载
 * 无需手动调用 MqAutoConfiguration.init()
 */

process.env.MQ_TYPE = 'memory';

import 'reflect-metadata';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { createApp } from '@ai-partner-x/aiko-boot/boot';
import {
  MqListener,
  MqHandler,
  Payload,
  ConsumerContainer,
  MqTemplate,
  MqAutoConfiguration,
} from '@ai-partner-x/aiko-boot-starter-mq';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}

class UserCreatedListener {
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    console.log('[Consumer] User created (via createApp):', event);
  }
}

// 手动应用装饰器
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

ConsumerContainer.registerListener(UserCreatedListener);

async function main(): Promise<void> {
  console.log('=== @ai-partner-x/aiko-boot-starter-mq + createApp 示例 ===\n');

  // createApp 会自动发现并加载 MqAutoConfiguration（@OnApplicationReady 时初始化）
  const context = await createApp({
    srcDir: join(__dirname, '../src'),
    configPath: join(__dirname, '../../..'), //  monorepo root，用于扫描 node_modules
    verbose: true,
  });

  console.log('\n--- 发送消息 ---');
  const template = new MqTemplate();
  const payload: UserCreatedEvent = {
    userId: 'u-' + Date.now(),
    email: 'user@example.com',
    name: 'Alice (createApp)',
  };
  await template.send('user.created', payload);
  console.log('Message published:', payload);

  // 关闭 MQ 连接
  const adapter = MqAutoConfiguration.getAdapter();
  await adapter.close();

  console.log('\n=== 示例完成 ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
