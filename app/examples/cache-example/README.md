# cache-example

> 展示 `@ai-first/cache` 在应用层的真实用法。

## 功能特性

- ✅ `@RedisComponent` — 标记缓存组件
- ✅ `@Cacheable` — 读通缓存（查询）
- ✅ `@CachePut` — 写通缓存（更新）
- ✅ `@CacheEvict` — 缓存失效（创建/删除）
- ✅ `RedisTemplate` — 直接 Redis 操作（String / Hash / ZSet）
- ✅ 无 Redis 时自动降级（装饰器直接调用原方法）

## 目录结构

```
src/
├── entity/
│   └── user.entity.ts           # 用户实体定义
├── service/
│   └── user.cache.service.ts    # 用户缓存服务（带缓存装饰器）
└── index.ts                     # 主入口 & 演示脚本
```

## 快速启动

```bash
# 安装依赖
pnpm install

# 运行（无 Redis，装饰器自动降级）
pnpm start

# 运行（有 Redis）
REDIS_HOST=127.0.0.1 REDIS_PORT=6379 pnpm start
```

## 对应 Java Spring Boot

| TypeScript（AI-First）| Java（Spring Boot）|
|---|---|
| `@RedisComponent()` | `@Service` |
| `@Cacheable({ key, ttl })` | `@Cacheable(value, key)` |
| `@CachePut({ key, ttl })` | `@CachePut(value, key)` |
| `@CacheEvict({ key })` | `@CacheEvict(value, key)` |
| `RedisTemplate<K, V>` | `RedisTemplate<K, V>` |

## 核心代码

```typescript
import { RedisComponent, Cacheable, CachePut, CacheEvict } from '@ai-first/cache';

@RedisComponent({ name: 'UserCacheService' })
export class UserCacheService {
  @Cacheable({ key: 'user', ttl: 300 })
  async getUserById(id: number): Promise<User | null> {
    return db.findUser(id);  // Redis 命中时不会执行
  }

  @CachePut({ key: 'user', ttl: 300, keyGenerator: (id) => String(id) })
  async updateUser(id: number, data: Partial<User>): Promise<User> {
    return db.updateUser(id, data);  // 始终执行，结果写入缓存
  }

  @CacheEvict({ key: 'user' })
  async deleteUser(id: number): Promise<boolean> {
    return db.deleteUser(id);  // 执行后清除缓存
  }
}
```
