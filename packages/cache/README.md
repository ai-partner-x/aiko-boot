# @ai-first/cache

Spring Boot 风格的缓存抽象层，对标 **Spring Cache + Spring Data Redis**，为 AI-First Framework 应用提供声明式缓存与 Redis 数据访问能力。

---

## 功能概述

`@ai-first/cache` 将 Spring Boot 缓存体系完整移植到 TypeScript 生态，提供两个独立的入口点：

| 入口 | 对标 Spring | 职责 |
|---|---|---|
| `@ai-first/cache` | `spring-context`（Spring Cache 抽象） | 声明式缓存注解、CacheManager SPI、启动初始化 |
| `@ai-first/cache/redis` | `spring-data-redis`（Spring Data Redis） | Redis 连接管理、RedisTemplate、数据结构操作 |

**核心能力：**

- **声明式缓存**：`@Cacheable` / `@CachePut` / `@CacheEvict` 三个方法装饰器，零侵入地为业务方法添加缓存语义
- **CacheManager SPI**：`Cache` + `CacheManager` 标准接口，任意缓存后端（Redis、Memcached、内存等）均可无缝接入
- **通用缓存配置**：`CacheConfig` 辨别联合类型（`type: 'redis' | ...`）对标 `spring.cache.type`，支持按配置切换后端
- **Redis 数据访问**：`RedisTemplate` / `StringRedisTemplate` + `opsForValue` / `opsForList` / `opsForHash` / `opsForSet` / `opsForZSet`，完整覆盖 Redis 五种数据结构
- **多种 Redis 拓扑**：单机（standalone）、哨兵（sentinel）、集群（cluster）三种连接模式
- **优雅降级**：CacheManager 未注册时，缓存装饰器自动透传原方法，不阻断业务逻辑

---

## 开发思路

### 问题与动机

传统做法将缓存实现（如 `ioredis`）直接硬编码在业务代码或启动配置中：

```typescript
// ❌ 缓存后端与业务代码强耦合
import Redis from 'ioredis';
const client = new Redis({ host: 'localhost', port: 6379 });
const cached = await client.get(`user:${id}`);
```

这导致：切换缓存后端（如从 Redis 切到 Memcached）需要修改所有业务代码；测试时无法轻易替换为内存实现；`createApp({ cache })` 的 `cache` 选项写死为 `RedisConfig`，框架 API 无法拓展。

### 设计思路

1. **分层解耦**：将「缓存语义」与「缓存实现」分离，对应 Spring 的 Cache 抽象层设计

   ```
   业务代码(@Cacheable)
       ↓ 通过 CacheManager 接口
   后端实现(RedisCacheManager / InMemoryCacheManager / ...)
       ↓ 通过具体技术
   底层驱动(ioredis / memjs / ...)
   ```

2. **SPI 扩展点**：`Cache` + `CacheManager` 两个接口定义稳定契约，新后端只需实现接口并调用 `setCacheManager()` 注册，业务代码零改动

3. **CacheConfig 联合类型**：以 `type` 字段作为辨别符（类似 `spring.cache.type`），为框架 API 的 `cache` 选项提供稳定、可拓展的配置类型：

   ```typescript
   // @ai-first/nextjs createApp 接受 CacheConfig，而非 Redis 专用类型
   createApp({ cache: { type: 'redis', host: '127.0.0.1', port: 6379 } })
   // 未来：
   createApp({ cache: { type: 'memcached', host: '127.0.0.1', port: 11211 } })
   ```

4. **双入口分层**：`@ai-first/cache` 只依赖缓存抽象（无 ioredis 直接依赖），`@ai-first/cache/redis` 提供 Redis 专属 API，用户按需引入

---

## 技术实现

### 入口 1：`@ai-first/cache`（缓存抽象层）

#### CacheManager SPI（`src/spi/cache.ts`）

定义两个扩展接口，对应 `org.springframework.cache.Cache` 和 `CacheManager`：

```typescript
interface Cache {
  getName(): string;
  get(entryKey: string): Promise<string | null>;
  put(entryKey: string, value: string, ttlSeconds?: number): Promise<void>;
  evict(entryKey: string): Promise<void>;
  clear(): Promise<void>;          // 使用 SCAN 游标，非阻塞
}

interface CacheManager {
  getCache(name: string): Cache;   // 懒加载，按需创建命名空间
}
```

#### 全局注册表（`src/cache-manager-registry.ts`）

维护单例 `CacheManager`，装饰器通过 `getCacheManager()` 获取，与后端完全解耦：

```typescript
setCacheManager(new RedisCacheManager(client));   // 注册（通常由 initializeCaching 自动完成）
getCacheManager();                                 // 装饰器内部调用
clearCacheManager();                               // 测试/关闭时清理
```

#### 缓存注解（`src/decorators.ts`）

三个方法装饰器，对应 Spring Cache 的同名注解：

| 装饰器 | 对标 Spring | 行为 |
|---|---|---|
| `@Cacheable(options)` | `@Cacheable` | 先查缓存，命中则返回；未命中则执行方法并写入缓存 |
| `@CachePut(options)` | `@CachePut` | 每次执行方法，并将结果写入/更新缓存 |
| `@CacheEvict(options)` | `@CacheEvict` | 执行方法后删除缓存（`allEntries: true` 清空整个命名空间） |

装饰器选项：

```typescript
interface CacheableOptions {
  key: string;                               // 缓存命名空间（如 'user'）
  ttl?: number;                              // 过期时间（秒）
  keyGenerator?: (...args: unknown[]) => string;  // 自定义条目 key
  condition?: (...args: unknown[]) => boolean;    // 缓存条件
}

interface CacheEvictOptions {
  key: string;
  keyGenerator?: (...args: unknown[]) => string;
  allEntries?: boolean;          // true = 清空整个命名空间
  beforeInvocation?: boolean;   // true = 方法执行前清除
}
```

**优雅降级**：`getCacheManager()` 返回 `null` 时（即未注册任何后端），装饰器透传原方法，不抛出异常。

#### 通用缓存配置（`src/spi/cache-config.ts`）

`CacheConfig` 辨别联合类型，`type` 字段对标 `spring.cache.type`：

```typescript
export type RedisCacheConfig = { type: 'redis' } & RedisConfig;

export type CacheConfig =
  | RedisCacheConfig;
  // 未来可扩展：
  // | { type: 'simple' }
  // | { type: 'memcached'; host: string; port: number }
  // | { type: 'caffeine'; spec?: string }
```

新增后端只需：① 追加联合类型成员，② 在 `initializeCaching()` 的 `switch` 中添加一个 `case`，业务代码和注解**零改动**。

#### 启动初始化（`src/enable-caching.ts`）

`initializeCaching(config: CacheConfig)` 根据 `config.type` 分发到对应后端的初始化逻辑：

```
config.type === 'redis'
  → 创建短生命周期客户端发送 PING（5 秒超时，连接失败立即报错）
  → PING 成功后创建持久客户端
  → setCacheManager(new RedisCacheManager(client))
```

连接失败抛出 `CacheInitializationError`，阻止应用启动（对应 Spring 的 `BeanCreationException`）。

---

### 入口 2：`@ai-first/cache/redis`（Spring Data Redis 层）

#### Redis 连接配置（`src/config.ts`）

支持三种拓扑，通过 `mode` 字段区分：

| mode | 类型 | 说明 |
|---|---|---|
| `undefined` / `'standalone'` | `RedisStandaloneConfig` | 单机模式（默认） |
| `'sentinel'` | `RedisSentinelConfig` | 哨兵高可用模式 |
| `'cluster'` | `RedisClusterConfig` | 集群水平扩展模式 |

#### RedisTemplate（`src/redis-template.ts`）

Spring `RedisTemplate<K, V>` 风格的操作模板，基于 `IORedisAdapter` 封装 ioredis：

```typescript
class RedisTemplate<K = string, V = unknown> {
  opsForValue(): ValueOperations<K, V>     // String 类型操作
  opsForList(): ListOperations<K, V>       // List 类型操作
  opsForHash<HK, HV>(): HashOperations<K, HK, HV>  // Hash 类型操作
  opsForSet(): SetOperations<K, V>         // Set 类型操作
  opsForZSet(): ZSetOperations<K, V>       // Sorted Set 类型操作
  delete(keys: K | K[]): Promise<number>   // 删除 key
}

class StringRedisTemplate extends RedisTemplate<string, string> {}  // 字符串专用
```

#### RedisCacheManager（`src/cache-managers/redis-cache-manager.ts`）

实现 `CacheManager` / `Cache` SPI 接口的 Redis 后端：

- 物理 key 格式：`{namespace}::{entryKey}`（entryKey 为空时退化为 `{namespace}`）
- `clear()` 使用游标 `SCAN` 批量删除，避免 `KEYS *` 阻塞 Redis

---

## 快速开始

### 安装

```bash
pnpm add @ai-first/cache
```

### 方式一：与 `createApp` 集成（推荐）

最简单的方式，在 `createApp` 时传入 `cache` 配置，框架自动完成连接验证和 CacheManager 注册：

```typescript
import { createApp } from '@ai-first/nextjs';

const app = await createApp({
  srcDir: import.meta.dirname,
  cache: {
    type: 'redis',
    host: process.env.REDIS_HOST ?? '127.0.0.1',
    port: Number(process.env.REDIS_PORT ?? 6379),
  },
});
app.listen(3001);
```

Redis Sentinel（高可用）：

```typescript
const app = await createApp({
  srcDir: import.meta.dirname,
  cache: {
    type: 'redis',
    mode: 'sentinel',
    masterName: 'mymaster',
    sentinels: [
      { host: '127.0.0.1', port: 26379 },
      { host: '127.0.0.1', port: 26380 },
    ],
  },
});
```

### 方式二：手动初始化

```typescript
import 'reflect-metadata';
import { initializeCaching, CacheInitializationError } from '@ai-first/cache';

try {
  await initializeCaching({
    type: 'redis',
    host: '127.0.0.1',
    port: 6379,
  });
  console.log('缓存初始化成功');
} catch (e) {
  if (e instanceof CacheInitializationError) {
    console.error('Redis 连接失败，应用终止');
    process.exit(1);
  }
  throw e;
}
```

### 声明式缓存注解

在 `@Service` / `@Component` 类的方法上使用缓存注解（需先完成缓存初始化）：

```typescript
import { Service } from '@ai-first/core';
import { Cacheable, CachePut, CacheEvict } from '@ai-first/cache';
import { Autowired } from '@ai-first/di/server';

@Service()
export class UserService {
  @Autowired()
  private userRepository!: UserRepository;

  // 读通缓存：命中则直接返回，不访问数据库
  @Cacheable({ key: 'user', ttl: 300 })
  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.selectById(id);
  }

  // 写通缓存：执行方法并将结果更新到缓存
  @CachePut({ key: 'user', ttl: 300 })
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return this.userRepository.updateById(id, data);
  }

  // 删除缓存：执行方法后清除对应条目
  @CacheEvict({ key: 'user' })
  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.deleteById(id);
  }

  // 清空整个命名空间
  @CacheEvict({ key: 'user', allEntries: true })
  async clearUserCache(): Promise<void> {}

  // 自定义条目 key 生成（keyGenerator 参数类型与方法参数保持一致）
  @Cacheable({
    key: 'user',
    ttl: 60,
    keyGenerator: (page: number, size: number) => `list:${page}:${size}`,
  })
  async getUserList(page: number, size: number): Promise<User[]> {
    return this.userRepository.selectPage(page, size);
  }
}
```

### RedisTemplate 直接操作

使用 `@ai-first/cache/redis` 进行底层 Redis 数据结构操作：

```typescript
import {
  getRedisClient,
  RedisTemplate,
  StringRedisTemplate,
} from '@ai-first/cache/redis';

// 在 createApp / initializeCaching 之后获取客户端
const client = getRedisClient();

// 通用模板（支持 JSON 序列化）
const redisTemplate = new RedisTemplate<string, unknown>({ client });

// String 操作
const valueOps = redisTemplate.opsForValue();
await valueOps.set('user:1', { name: '张三', age: 25 }, 3600);
const user = await valueOps.get('user:1');   // { name: '张三', age: 25 }
await valueOps.increment('counter');

// Hash 操作
const hashOps = redisTemplate.opsForHash<string, string>();
await hashOps.put('user:profile:1', 'name', '张三');
const name = await hashOps.get('user:profile:1', 'name');

// List 操作
const listOps = redisTemplate.opsForList();
await listOps.rightPush('queue', 'task1');
const task = await listOps.leftPop('queue');

// 字符串专用模板
const stringTemplate = new StringRedisTemplate({ client });
await stringTemplate.opsForValue().set('greeting', 'hello', 60);

// 删除 key
await redisTemplate.delete(['user:1', 'user:2']);
```

### 自定义缓存后端（SPI 扩展）

实现 `Cache` + `CacheManager` 接口，可接入任意缓存后端（如 Memcached、内存缓存、测试 Mock）：

```typescript
import { Cache, CacheManager, setCacheManager } from '@ai-first/cache';

class MapCache implements Cache {
  private store = new Map<string, { value: string; expiresAt?: number }>();
  constructor(public readonly name: string) {}

  getName() { return this.name; }

  async get(entryKey: string): Promise<string | null> {
    const entry = this.store.get(entryKey);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(entryKey);
      return null;
    }
    return entry.value;
  }

  async put(entryKey: string, value: string, ttlSeconds?: number): Promise<void> {
    this.store.set(entryKey, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : undefined,
    });
  }

  async evict(entryKey: string): Promise<void> { this.store.delete(entryKey); }
  async clear(): Promise<void> { this.store.clear(); }
}

class MapCacheManager implements CacheManager {
  private caches = new Map<string, MapCache>();
  getCache(name: string): Cache {
    if (!this.caches.has(name)) this.caches.set(name, new MapCache(name));
    return this.caches.get(name)!;
  }
}

// 测试环境：使用内存缓存替代 Redis
setCacheManager(new MapCacheManager());
```

---

## API 参考

### `@ai-first/cache` 导出

| 导出 | 类型 | 说明 |
|---|---|---|
| `Cacheable(options)` | 方法装饰器 | 读通缓存 |
| `CachePut(options)` | 方法装饰器 | 写通缓存 |
| `CacheEvict(options)` | 方法装饰器 | 删除缓存 |
| `initializeCaching(config)` | `async function` | 根据 `config.type` 初始化缓存后端 |
| `CacheInitializationError` | 类 | 初始化失败异常 |
| `CacheConfig` | 类型 | 通用缓存配置联合类型（`type: 'redis' | ...`） |
| `RedisCacheConfig` | 类型 | Redis 后端配置（`{ type: 'redis' } & RedisConfig`） |
| `Cache` | 接口 | 缓存命名空间操作 SPI |
| `CacheManager` | 接口 | 缓存管理器 SPI |
| `setCacheManager(manager)` | 函数 | 注册 CacheManager |
| `getCacheManager()` | 函数 | 获取当前 CacheManager |
| `Autowired` | 装饰器 | DI 属性注入（re-export from `@ai-first/di`） |

### `@ai-first/cache/redis` 导出

| 导出 | 类型 | 说明 |
|---|---|---|
| `RedisConfig` | 类型 | Redis 连接配置（standalone / sentinel / cluster） |
| `createRedisConnection(config)` | 函数 | 创建并保存全局 Redis 连接 |
| `getRedisClient()` | 函数 | 获取全局 Redis 客户端 |
| `closeRedisConnection()` | `async function` | 关闭 Redis 连接 |
| `RedisTemplate<K, V>` | 类 | 通用 Redis 操作模板 |
| `StringRedisTemplate` | 类 | 字符串专用模板 |
| `RedisCacheManager` | 类 | CacheManager SPI 的 Redis 实现 |

---

## License

MIT
