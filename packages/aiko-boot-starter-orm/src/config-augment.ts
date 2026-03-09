/**
 * @ai-partner-x/aiko-boot-starter-orm 类型扩展
 * 
 * 通过 module augmentation 扩展 @ai-partner-x/aiko-boot 的 AppConfig
 */

import type { DatabaseProperties } from './auto-configuration.js';

// 重新导出配置类型
export type { DatabaseProperties };

// 为了兼容性，同时导出 DatabaseConnectionConfig
export type { DatabaseConnectionConfig } from './database.js';

/**
 * 扩展 @ai-partner-x/aiko-boot 的 AppConfig 接口
 * 
 * 安装此包后，AppConfig 自动包含 database 配置
 */
declare module '@ai-partner-x/aiko-boot' {
  interface AppConfig {
    /** 数据库配置 (aiko-boot-starter-orm) */
    database?: DatabaseProperties;
  }
}
