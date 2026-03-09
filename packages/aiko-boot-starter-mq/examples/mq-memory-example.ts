/**
 * MQ Memory Example - 使用内存适配器运行，无需 RabbitMQ
 *
 * 与 mq-publish-consume.ts 相同的流程，使用 MQ_TYPE=memory
 */

process.env.MQ_TYPE = 'memory';

import 'reflect-metadata';
import {
  MqListener,
  MqHandler,
  Payload,
  ConsumerContainer,
  MqTemplate,
  MqAutoConfiguration,
} from '../src/index.js';

export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}

class UserCreatedListener {
  async handleUserCreated(event: UserCreatedEvent): Promise<void> {
    console.log('[Consumer] User created event received:', event);
  }
}

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

async function main(): Promise<void> {
  console.log('=== @ai-partner-x/aiko-boot-starter-mq Memory Example (no RabbitMQ required) ===\n');

  ConsumerContainer.registerListener(UserCreatedListener);
  await MqAutoConfiguration.init();

  const mqTemplate = new MqTemplate();
  console.log('--- PUBLISH ---');
  const payload: UserCreatedEvent = {
    userId: 'u-' + Date.now(),
    email: 'user@example.com',
    name: 'Alice',
  };
  await mqTemplate.send('user.created', payload);
  console.log('Message published:', payload);
  console.log('');

  const adapter = MqAutoConfiguration.getAdapter();
  await adapter.close();

  console.log('\n=== Example Complete ===');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
