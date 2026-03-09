/**
 * Cache-Example API Server — Spring Boot 风格自动配置
 *
 * 演示 @ai-first/aiko-boot-starter-cache 与 REST API 的集成：
 * - createApp 自动扫描 mapper/ service/ controller/ 并注册到 DI 容器
 * - SQLite 提供持久化存储（@ai-first/orm + Kysely）
 * - 可选：通过环境变量启用 Redis 缓存（@ai-first/aiko-boot-starter-cache）
 *
 * 运行前先初始化数据库：
 *   pnpm init-db
 *
 * 启动服务：
 *   # 无 Redis（缓存装饰器自动降级，直接访问 DB）
 *   pnpm server
 *
 *   # 有 Redis，无密码
 *   REDIS_HOST=127.0.0.1 REDIS_PORT=6379 pnpm server
 *
 *   # 有 Redis，带密码
 *   REDIS_HOST=127.0.0.1 REDIS_PORT=6379 REDIS_PASSWORD=yourpassword pnpm server
 *
 * 接口列表：
 *   GET    http://localhost:3002/api/users
 *   GET    http://localhost:3002/api/users/:id
 *   POST   http://localhost:3002/api/users
 *   PUT    http://localhost:3002/api/users/:id
 *   DELETE http://localhost:3002/api/users/:id
 */

import 'reflect-metadata';
import { createApp } from '@ai-first/nextjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { type CacheConfig } from '@ai-first/cache';

const __dirname = dirname(fileURLToPath(import.meta.url));

const PORT   = process.env.PORT         || 3002;
const REDIS_HOST     = process.env.REDIS_HOST;
const REDIS_PORT     = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;
// 空字符串 (`REDIS_PASSWORD=`) 通过 `|| undefined` 统一转为 undefined，
// 与无密码模式等价，不会被传入 ioredis 的 auth 流程。
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || undefined;

// 仅在配置了 REDIS_HOST 时才传入 aiko-boot-starter-cache 选项
const cacheConfig: CacheConfig | undefined = REDIS_HOST
  ? { type: 'redis', host: REDIS_HOST, port: REDIS_PORT, password: REDIS_PASSWORD }
  : undefined;

const app = await createApp({
  srcDir: __dirname,
  database: {
    type: 'sqlite',
    filename: join(__dirname, '../data/cache_example.db'),
  },
  ...(cacheConfig ? { cache: cacheConfig } : {}),
});

app.listen(PORT, () => {
  const redisInfo = REDIS_HOST
    ? `Redis @ ${REDIS_HOST}:${REDIS_PORT}${REDIS_PASSWORD ? ' (auth)' : ''}`
    : 'no Redis (aiko-boot-starter-cache decorators degrade gracefully)';
  console.log(`\n🚀 Cache-Example API Server running at http://localhost:${PORT}`);
  console.log(`📚 Users API: http://localhost:${PORT}/api/users`);
  console.log(`🔴 Cache:     ${redisInfo}\n`);
});
