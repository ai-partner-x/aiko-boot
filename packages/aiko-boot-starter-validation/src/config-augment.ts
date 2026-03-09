/**
 * @ai-partner-x/aiko-boot-starter-validation 类型扩展
 * 
 * 通过 module augmentation 扩展 @ai-partner-x/aiko-boot 的 AppConfig
 */

import type { ValidationProperties } from './auto-configuration.js';

// 重新导出配置类型
export type { ValidationProperties };

/**
 * 扩展 @ai-partner-x/aiko-boot 的 AppConfig 接口
 * 
 * 安装此包后，AppConfig 自动包含 validation 配置
 */
declare module '@ai-partner-x/aiko-boot' {
  interface AppConfig {
    /** 验证配置 (aiko-boot-starter-validation) */
    validation?: ValidationProperties;
  }
}
