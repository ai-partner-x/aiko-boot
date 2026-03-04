/**
 * 用户缓存服务
 *
 * 展示 @ai-first/cache 在实际应用中的用法：
 * - @RedisComponent 标记缓存组件
 * - @Cacheable 读通缓存（查询）
 * - @CachePut 写通缓存（更新）
 * - @CacheEvict 缓存失效（删除）
 *
 * 对应 Java Spring Boot:
 * @Service
 * public class UserCacheService { ... }
 */

import { RedisComponent, Cacheable, CachePut, CacheEvict } from '@ai-first/cache';
import { type User } from '../entity/user.entity.js';

@RedisComponent({ name: 'UserCacheService' })
export class UserCacheService {
  // 模拟数据库（实际项目中替换为 UserMapper 或数据库调用）
  private db: Map<number, User> = new Map([
    [1, { id: 1, name: '张三', email: 'zhangsan@example.com', age: 25 }],
    [2, { id: 2, name: '李四', email: 'lisi@example.com', age: 30 }],
    [3, { id: 3, name: '王五', email: 'wangwu@example.com', age: 22 }],
  ]);
  private nextId = 4;

  /**
   * 查询单个用户（带缓存）
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
   * 查询用户列表（带缓存）
   *
   * TypeScript: @Cacheable({ key: 'user:list', ttl: 60 })
   * Java: @Cacheable(value = "user:list")
   */
  @Cacheable({ key: 'user:list', ttl: 60 })
  async getUserList(): Promise<User[]> {
    console.log('  [DB] 查询数据库: getUserList()');
    return [...this.db.values()];
  }

  /**
   * 创建用户（清除列表缓存）
   *
   * TypeScript: @CacheEvict({ key: 'user:list', allEntries: true })
   * Java: @CacheEvict(value = "user:list", allEntries = true)
   */
  @CacheEvict({ key: 'user:list', allEntries: true })
  async createUser(data: Omit<User, 'id'>): Promise<User> {
    console.log('  [DB] 写入数据库: createUser()');
    const user: User = { id: this.nextId++, ...data };
    this.db.set(user.id, user);
    return user;
  }

  /**
   * 更新用户（更新单条缓存，同时清除列表缓存）
   *
   * TypeScript: @CachePut({ key: 'user', ttl: 300 })
   * Java: @CachePut(value = "user", key = "#result.id")
   */
  @CachePut({ key: 'user', ttl: 300, keyGenerator: (id: unknown) => String(id as number) })
  async updateUser(id: number, data: Partial<Omit<User, 'id'>>): Promise<User> {
    console.log(`  [DB] 更新数据库: updateUser(${id})`);
    const user = this.db.get(id);
    if (!user) throw new Error(`用户 ${id} 不存在`);
    const updated: User = { ...user, ...data };
    this.db.set(id, updated);
    return updated;
  }

  /**
   * 删除用户（清除单条缓存）
   *
   * TypeScript: @CacheEvict({ key: 'user' })
   * Java: @CacheEvict(value = "user", key = "#id")
   */
  @CacheEvict({ key: 'user' })
  async deleteUser(id: number): Promise<boolean> {
    console.log(`  [DB] 删除数据库: deleteUser(${id})`);
    return this.db.delete(id);
  }
}
