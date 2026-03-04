/**
 * User Cache Example - 用户缓存示例
 *
 * 展示 @ai-first/cache 的基本用法
 *
 * TypeScript 代码可以转译为等价的 Java Spring Boot Cache 代码
 *
 * 注意：装饰器示例无需 Redis 即可运行（未初始化时自动降级为直接调用）
 *       完整 RedisTemplate 操作需要运行中的 Redis 实例（默认 localhost:6379）
 */

import 'reflect-metadata';
import {
  RedisComponent,
  Cacheable,
  CachePut,
  CacheEvict,
  getRedisComponentMetadata,
} from '../src/index.js';

// ==================== Entity 定义 ====================

/**
 * 用户实体
 */
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

// ==================== Cache Service 定义 ====================

/**
 * 用户缓存服务
 *
 * TypeScript:
 * @RedisComponent()
 * class UserCacheService { ... }
 *
 * 转译为 Java:
 * @Service
 * public class UserCacheService { ... }
 */
@RedisComponent({ name: 'UserCacheService' })
class UserCacheService {
  // 模拟数据库
  private db: Map<number, User> = new Map([
    [1, { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 }],
    [2, { id: 2, name: '李四', email: 'lisi@example.com', age: 30 }],
    [3, { id: 3, name: '王五', email: 'wangwu@example.com', age: 22 }],
  ]);

  /**
   * 查询用户（带缓存）
   *
   * TypeScript: @Cacheable({ key: 'user', ttl: 300 })
   * Java: @Cacheable(value = "user", key = "#id")
   */
  @Cacheable({ key: 'user', ttl: 300 })
  async getUserById(id: number): Promise<User | null> {
    console.log(`  [DB] 查询数据库: getUserById(${id})`);
    return this.db.get(id) ?? null;
  }

  /**
   * 更新用户（更新缓存）
   *
   * TypeScript: @CachePut({ key: 'user', ttl: 300 })
   * Java: @CachePut(value = "user", key = "#result.id")
   */
  @CachePut({ key: 'user', ttl: 300, keyGenerator: (_id, user) => String((user as User).id) })
  async updateUser(_id: number, user: User): Promise<User> {
    console.log(`  [DB] 更新数据库: updateUser(${user.id})`);
    this.db.set(user.id, user);
    return user;
  }

  /**
   * 删除用户（清除缓存）
   *
   * TypeScript: @CacheEvict({ key: 'user' })
   * Java: @CacheEvict(value = "user", key = "#id")
   */
  @CacheEvict({ key: 'user' })
  async deleteUser(id: number): Promise<void> {
    console.log(`  [DB] 删除数据库: deleteUser(${id})`);
    this.db.delete(id);
  }

  /**
   * 清空所有用户缓存
   *
   * TypeScript: @CacheEvict({ key: 'user', allEntries: true })
   * Java: @CacheEvict(value = "user", allEntries = true)
   */
  @CacheEvict({ key: 'user', allEntries: true })
  async clearAll(): Promise<void> {
    console.log('  [DB] 清空所有用户缓存');
  }
}

// ==================== 使用示例 ====================

async function main() {
  console.log('=== @ai-first/cache User Cache Example ===\n');

  // 1. 查看 RedisComponent 元数据
  const meta = getRedisComponentMetadata(UserCacheService);
  console.log('RedisComponent Metadata:', meta);
  console.log('');

  // 2. 创建缓存服务实例
  const userService = new UserCacheService();

  // 3. @Cacheable - 查询用户（第一次访问 DB，有 Redis 时第二次命中缓存）
  console.log('--- @Cacheable ---');
  console.log('第一次查询（访问 DB）:');
  const user1 = await userService.getUserById(1);
  console.log('  result:', user1);

  console.log('第二次查询（有 Redis 则命中缓存，不访问 DB）:');
  const user1Cached = await userService.getUserById(1);
  console.log('  result:', user1Cached);
  console.log('');

  // 4. @CachePut - 更新用户并同步缓存
  console.log('--- @CachePut ---');
  const updated = await userService.updateUser(1, { ...user1!, name: '张三（已更新）' });
  console.log('  updated:', updated);
  console.log('');

  // 5. @CacheEvict - 删除用户并清除缓存
  console.log('--- @CacheEvict ---');
  await userService.deleteUser(2);
  console.log('  deleteUser(2) done');
  await userService.clearAll();
  console.log('  clearAll() done');
  console.log('');

  console.log('=== Example Complete ===');
}

main().catch(console.error);
