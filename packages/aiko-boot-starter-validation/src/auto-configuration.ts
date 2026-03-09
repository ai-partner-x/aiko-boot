/**
 * Validation Auto Configuration - Spring Boot 风格自动配置
 * 
 * 根据配置文件自动配置验证行为
 * 
 * @example
 * ```json
 * // app.config.json
 * {
 *   "validation": {
 *     "enabled": true,
 *     "failFast": false,
 *     "defaultMessage": "Validation failed"
 *   }
 * }
 * ```
 */
import 'reflect-metadata';
import {
  AutoConfiguration,
  ConfigurationProperties,
  ConditionalOnProperty,
  OnApplicationReady,
  ConfigLoader,
} from '@ai-partner-x/aiko-boot/boot';
import { Component } from '@ai-partner-x/aiko-boot';

/**
 * 验证配置属性类
 * 
 * 对应配置文件中的 validation.* 配置
 */
@ConfigurationProperties('validation')
export class ValidationProperties {
  /** 是否启用验证 */
  enabled?: boolean = true;
  
  /** 遇到第一个错误即停止验证 */
  failFast?: boolean = false;
  
  /** 默认错误消息 */
  defaultMessage?: string = 'Validation failed';
  
  /** 是否在错误中包含字段名 */
  includeFieldNames?: boolean = true;
  
  /** 验证组 */
  groups?: string[];
}

/** 全局验证配置 */
let globalValidationConfig: ValidationProperties = new ValidationProperties();

/**
 * 获取全局验证配置
 */
export function getValidationConfig(): ValidationProperties {
  return globalValidationConfig;
}

/**
 * 设置全局验证配置
 */
export function setValidationConfig(config: Partial<ValidationProperties>): void {
  globalValidationConfig = { ...globalValidationConfig, ...config };
}

/**
 * Validation 自动配置类
 * 
 * 当配置了 validation.enabled = true 时自动配置验证
 */
@AutoConfiguration({ order: 50 })
@ConditionalOnProperty('validation.enabled', { havingValue: 'true', matchIfMissing: true })
@Component()
export class ValidationAutoConfiguration {

  /**
   * 应用启动时初始化验证配置
   */
  @OnApplicationReady({ order: -50 })
  async initializeValidation(): Promise<void> {
    const enabled = ConfigLoader.get<boolean>('validation.enabled', true);
    if (!enabled) {
      console.log('📋 [aiko-validation] Validation disabled by configuration');
      return;
    }

    const config: ValidationProperties = {
      enabled: true,
      failFast: ConfigLoader.get<boolean>('validation.failFast', false),
      defaultMessage: ConfigLoader.get<string>('validation.defaultMessage', 'Validation failed'),
      includeFieldNames: ConfigLoader.get<boolean>('validation.includeFieldNames', true),
      groups: ConfigLoader.get<string[]>('validation.groups', []),
    };

    setValidationConfig(config);
    console.log('✅ [aiko-validation] Validation configured');
  }
}
