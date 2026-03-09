/**
 * @ai-partner-x/aiko-boot 配置类型定义
 * 
 * 基础配置接口，各 starter 通过 declare module 扩展
 * 配置风格参考 Spring Boot: https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html
 */

// ==================== 通用配置类型 ====================

/**
 * 日志级别配置 (Spring Boot 风格)
 * 
 * @example
 * ```typescript
 * logging: {
 *   level: {
 *     root: 'info',
 *     'com.example': 'debug'
 *   }
 * }
 * ```
 */
export interface LoggingLevelConfig {
  /** 根日志级别 (logging.level.root) */
  root?: 'debug' | 'info' | 'warn' | 'error';
  /** 包级别日志配置 */
  [packageName: string]: 'debug' | 'info' | 'warn' | 'error' | undefined;
}

/**
 * 日志配置 (Spring Boot 风格)
 * @see https://docs.spring.io/spring-boot/docs/current/reference/html/application-properties.html#appendix.application-properties.core
 */
export interface LoggingConfig {
  /** 日志级别配置 (logging.level.*) */
  level?: LoggingLevelConfig;
  /** 日志文件路径 (logging.file.name) */
  file?: {
    name?: string;
  };
  /** 日志格式 */
  pattern?: {
    console?: string;
    file?: string;
  };
}

// ==================== 统一配置接口 ====================

/**
 * 应用配置类型（基础接口）
 * 
 * 各 starter 通过 module augmentation 扩展此接口:
 * - aiko-boot-starter-web: 添加 server 配置
 * - aiko-boot-starter-orm: 添加 database 配置
 * - aiko-boot-starter-validation: 添加 validation 配置
 * 
 * @example
 * ```typescript
 * // app.config.ts
 * import type { AppConfig } from '@ai-partner-x/aiko-boot';
 * 
 * export default {
 *   server: { port: 3001 },
 *   database: { type: 'sqlite', filename: './app.db' },
 * } satisfies AppConfig;
 * ```
 */
export interface AppConfig {
  /** 日志配置 */
  logging?: LoggingConfig;
  /** 自定义配置扩展 */
  [key: string]: unknown;
}

