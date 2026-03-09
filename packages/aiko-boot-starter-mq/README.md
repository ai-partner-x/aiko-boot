# @ai-partner-x/aiko-boot-starter-mq

MQ 模块，Spring Boot 风格的消息队列。支持 RabbitMQ，可扩展 Kafka / Redis。

## 安装

```bash
pnpm add @ai-partner-x/aiko-boot-starter-mq
```

## 配置

通过环境变量或代码配置：

- `MQ_TYPE`: `rabbitmq` | `kafka` | `redis`（默认 `rabbitmq`）
- `MQ_HOST`: 主机（默认 `localhost`）
- `MQ_PORT`: 端口（默认 `5672`）
- `MQ_USERNAME` / `MQ_PASSWORD`: 认证
- `MQ_VHOST`: 虚拟主机（默认 `/`）

## 使用

### 1. 定义消费者

```ts
import { MqListener, MqHandler, Payload, ConsumerContainer } from '@ai-partner-x/aiko-boot-starter-mq';

export interface UserCreatedEvent {
  userId: string;
  email: string;
  name: string;
}

@MqListener({
  queue: 'user.created',
  retry: 3,
  dlq: 'user.created.dlq',
})
export class UserCreatedListener {
  @MqHandler()
  async handleUserCreated(@Payload() event: UserCreatedEvent) {
    console.log('User created:', event);
  }
}

ConsumerContainer.registerListener(UserCreatedListener);
```

### 2. 发送消息

```ts
import { MqTemplate } from '@ai-partner-x/aiko-boot-starter-mq';

const mqTemplate = new MqTemplate();
await mqTemplate.send('user.created', {
  userId: '123',
  email: 'user@example.com',
  name: 'John Doe',
});
```

### 3. 启动方式

**方式 A：使用 createApp（推荐）**

当项目使用 `createApp()` 时，MqAutoConfiguration 会自动发现并加载，无需手动初始化。

```ts
import { createApp } from '@ai-partner-x/aiko-boot/boot';
import { ConsumerContainer, MqTemplate } from '@ai-partner-x/aiko-boot-starter-mq';
import './listeners/UserCreatedListener'; // 注册消费者

const context = await createApp({ srcDir: __dirname });
// MQ 已在 ApplicationReady 时自动初始化
const template = new MqTemplate();
await template.send('user.created', payload);
```

**方式 B：手动初始化（如 Next.js、独立脚本）**

```ts
import { MqAutoConfiguration } from '@ai-partner-x/aiko-boot-starter-mq';
import './listeners/UserCreatedListener'; // 注册消费者

let initialized = false;

export async function initMq() {
  if (initialized) return;
  await MqAutoConfiguration.init();
  initialized = true;
}

if (typeof window === 'undefined' && !initialized) {
  initMq().catch(console.error);
}
```

## 目录结构

```
packages/mq/src/
├── config/           # MqProperties, MqAutoConfiguration
├── decorators/       # @MqListener, @MqHandler, @Payload
├── producer/         # MqTemplate, MqProducer
├── consumer/         # MessageListener, ConsumerContainer
├── adapters/         # RabbitMqAdapter（可扩展 Kafka/Redis）
├── logger.ts
└── index.ts
```
