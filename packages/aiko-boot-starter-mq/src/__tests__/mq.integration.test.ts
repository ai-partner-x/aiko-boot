/**
 * MQ 集成测试 - 验证发布/消费流程
 * 使用 InMemoryMqAdapter，无需 RabbitMQ
 */

import 'reflect-metadata';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  MqListener,
  MqHandler,
  Payload,
  ConsumerContainer,
  MqTemplate,
  MqAutoConfiguration,
  InMemoryMqAdapter,
  loadMqProperties,
  getMqListenerMetadata,
  getMqHandlerMethods,
  getPayloadIndex,
} from '../index.js';

// 测试前需要设置 MQ_TYPE=memory，loadMqProperties 会读取
// MqAutoConfiguration.resetForTesting 用于隔离测试

// ============ 装饰器元数据测试 ============

describe('MQ Decorators', () => {
  it('getMqListenerMetadata returns listener options', () => {
    @MqListener({ queue: 'test.queue', retry: 2, dlq: 'test.dlq' })
    class TestListener {
      @MqHandler()
      handle(@Payload() _data: unknown) {}
    }
    const meta = getMqListenerMetadata(TestListener);
    expect(meta).toEqual({ queue: 'test.queue', retry: 2, dlq: 'test.dlq' });
  });

  it('getMqHandlerMethods returns handler method names', () => {
    @MqListener({ queue: 'q' })
    class TestListener {
      @MqHandler()
      handle(_d: unknown) {}
      other() {}
    }
    const methods = getMqHandlerMethods(TestListener);
    expect(methods).toEqual(['handle']);
  });

  it('getPayloadIndex returns parameter index', () => {
    @MqListener({ queue: 'q' })
    class TestListener {
      @MqHandler()
      handle(a: string, @Payload() _b: object, c: number) {}
    }
    const index = getPayloadIndex(TestListener.prototype, 'handle');
    expect(index).toBe(1);
  });
});

// ============ 发布/消费集成测试 ============

interface TestEvent {
  id: string;
  value: number;
}

const received: TestEvent[] = [];

@MqListener({
  queue: 'test.events',
  retry: 1,
  dlq: 'test.events.dlq',
})
class TestEventListener {
  @MqHandler()
  async handleEvent(@Payload() event: TestEvent): Promise<void> {
    received.push(event);
  }
}

describe('MQ Publish/Consume', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    received.length = 0;
    process.env = { ...originalEnv, MQ_TYPE: 'memory' };
    ConsumerContainer.clearListenersForTesting();
    MqAutoConfiguration.resetForTesting();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('publishes and consumes message via InMemoryMqAdapter', async () => {
    const props = loadMqProperties();
    expect(props.type).toBe('memory');

    const adapter = new InMemoryMqAdapter(props);
    await adapter.connect();

    ConsumerContainer.registerListener(TestEventListener);
    await ConsumerContainer.registerAll(adapter);

    const payload: TestEvent = { id: 'evt-1', value: 42 };
    await adapter.send('test.events', payload);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(payload);

    await adapter.close();
  });

  it('full flow with MqAutoConfiguration and MqTemplate', async () => {
    process.env.MQ_TYPE = 'memory';
    ConsumerContainer.registerListener(TestEventListener);

    await MqAutoConfiguration.init();

    const template = new MqTemplate();
    const payload: TestEvent = { id: 'evt-2', value: 100 };
    await template.send('test.events', payload);

    expect(received).toHaveLength(1);
    expect(received[0]).toEqual(payload);

    const adapter = MqAutoConfiguration.getAdapter();
    await adapter.close();
  });
});
