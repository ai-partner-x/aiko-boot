/**
 * @ai-first/cache — Spring Cache 缓存抽象层
 *
 * 对标 Spring Cache，提供统一的缓存抽象与注解：
 * - @Cacheable — 缓存方法返回值（读通缓存）
 * - @CachePut  — 执行方法并更新缓存（写通缓存）
 * - @CacheEvict — 清除缓存
 * - initializeCaching(config) — 启动时验证 Redis 连接
 *
 * Redis 连接管理与 RedisTemplate 等数据访问 API 位于：
 * @see @ai-first/cache/redis
 *
 * 对应 Spring 中:
 * ```
 * import org.springframework.cache.annotation.Cacheable;
 * import org.springframework.cache.annotation.CachePut;
 * import org.springframework.cache.annotation.CacheEvict;
 * ```
 */

// ==================== Cache Decorators (Spring Cache) ====================
export {
  Cacheable,
  CachePut,
  CacheEvict,
  getRedisComponentMetadata,
  REDIS_COMPONENT_METADATA,
  CACHEABLE_METADATA,
  CACHE_PUT_METADATA,
  CACHE_EVICT_METADATA,
  type CacheableOptions,
  type CacheEvictOptions,
  type CacheKeyGenerator,
} from './decorators.js';

// ==================== Startup Validation ====================
export {
  initializeCaching,
  CacheInitializationError,
} from './enable-caching.js';

// ==================== DI convenience re-export ====================
// 配合 @Cacheable/@CachePut/@CacheEvict 服务类中的 @Autowired 属性注入使用
export { Autowired } from '@ai-first/di/server';
