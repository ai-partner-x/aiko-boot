/**
 * Configuration System - Spring Boot Style
 * 
 * 支持:
 * 1. ConfigLoader - 加载配置文件 (JSON/YAML/环境变量)
 * 2. @ConfigurationProperties - 配置属性绑定到类
 * 3. @Value - 单个属性注入
 * 
 * @example
 * ```typescript
 * @ConfigurationProperties('database')
 * export class DatabaseProperties {
 *   host: string = 'localhost';
 *   port: number = 5432;
 *   username: string = '';
 *   password: string = '';
 * }
 * ```
 */
import 'reflect-metadata';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { Injectable, Singleton } from '../di/server.js';
import { Container } from '../di/server.js';

// Metadata keys (使用字符串而非 Symbol，以便跨 ESM 模块共享)
const CONFIG_PROPERTIES_METADATA = 'aiko-boot:configurationProperties';
const VALUE_METADATA = 'aiko-boot:value';

// 使用 globalThis 存储配置，以便跨 ESM 模块实例共享
const CONFIG_STORAGE_KEY = Symbol.for('aiko-boot:configStorage');

function getConfigStorage(): { config: Record<string, any>; loaded: boolean } {
  if (!(globalThis as any)[CONFIG_STORAGE_KEY]) {
    (globalThis as any)[CONFIG_STORAGE_KEY] = { config: {}, loaded: false };
  }
  return (globalThis as any)[CONFIG_STORAGE_KEY];
}

// 全局配置存储（兼容旧 API）
let _globalConfig: Record<string, any> = getConfigStorage().config;

// 已注册的配置属性类
const configPropertiesClasses: Array<{ prefix: string; target: Function }> = [];

/**
 * 配置加载器
 */
export class ConfigLoader {
  private static get config(): Record<string, any> {
    return getConfigStorage().config;
  }
  private static set config(value: Record<string, any>) {
    getConfigStorage().config = value;
    _globalConfig = value;
  }
  private static get loaded(): boolean {
    return getConfigStorage().loaded;
  }
  private static set loaded(value: boolean) {
    getConfigStorage().loaded = value;
  }

  /**
   * 加载配置文件
   * 
   * 加载顺序（后者覆盖前者）:
   * 1. app.config.ts (TypeScript 配置，推荐)
   * 2. app.config.json / app.config.yaml
   * 3. app.config.{profile}.json (如 app.config.development.json)
   * 4. 环境变量 (APP_DATABASE_HOST -> database.host)
   */
  static load(options: {
    basePath?: string;
    profile?: string;
    envPrefix?: string;
  } = {}): Record<string, any> {
    const {
      basePath = process.cwd(),
      profile = process.env.NODE_ENV || 'development',
      envPrefix = 'APP_',
    } = options;

    // 1. 加载默认配置文件 (JSON/YAML)
    this.loadConfigFile(join(basePath, 'app.config.json'));
    this.loadConfigFile(join(basePath, 'app.config.yaml'));
    this.loadConfigFile(join(basePath, 'app.config.yml'));

    // 2. 加载 profile 特定配置
    this.loadConfigFile(join(basePath, `app.config.${profile}.json`));
    this.loadConfigFile(join(basePath, `app.config.${profile}.yaml`));
    this.loadConfigFile(join(basePath, `app.config.${profile}.yml`));

    // 3. 加载环境变量
    this.loadFromEnv(envPrefix);

    this.loaded = true;
    _globalConfig = this.config;

    return this.config;
  }

  /**
   * 异步加载配置（支持 TypeScript 配置文件）
   * 
   * @example
   * ```typescript
   * await ConfigLoader.loadAsync({ basePath: __dirname });
   * ```
   */
  static async loadAsync(options: {
    basePath?: string;
    profile?: string;
    envPrefix?: string;
  } = {}): Promise<Record<string, any>> {
    const {
      basePath = process.cwd(),
      profile = process.env.NODE_ENV || 'development',
      envPrefix = 'APP_',
    } = options;

    // 1. 优先加载 TypeScript 配置文件
    await this.loadTsConfigFile(join(basePath, 'app.config.ts'));
    await this.loadTsConfigFile(join(basePath, 'app.config.js'));

    // 2. 加载 JSON/YAML 配置文件
    this.loadConfigFile(join(basePath, 'app.config.json'));
    this.loadConfigFile(join(basePath, 'app.config.yaml'));
    this.loadConfigFile(join(basePath, 'app.config.yml'));

    // 3. 加载 profile 特定配置
    this.loadConfigFile(join(basePath, `app.config.${profile}.json`));
    this.loadConfigFile(join(basePath, `app.config.${profile}.yaml`));
    this.loadConfigFile(join(basePath, `app.config.${profile}.yml`));

    // 4. 加载环境变量
    this.loadFromEnv(envPrefix);

    this.loaded = true;
    _globalConfig = this.config;

    return this.config;
  }

  /**
   * 从对象直接设置配置（用于测试或程序化配置）
   */
  static setConfig(config: Record<string, any>): void {
    this.config = this.deepMerge(this.config, config);
    _globalConfig = this.config;
    this.loaded = true;
  }

  /**
   * 获取配置值
   */
  static get<T = any>(key: string, defaultValue?: T): T {
    const value = this.getNestedValue(this.config, key);
    return (value !== undefined ? value : defaultValue) as T;
  }

  /**
   * 获取配置前缀下的所有配置
   */
  static getPrefix(prefix: string): Record<string, any> {
    return this.getNestedValue(this.config, prefix) || {};
  }

  /**
   * 检查配置是否已加载
   */
  static isLoaded(): boolean {
    return this.loaded;
  }

  /**
   * 清空配置（用于测试）
   */
  static clear(): void {
    this.config = {};
    _globalConfig = {};
    this.loaded = false;
  }

  /**
   * 获取全局配置对象（只读）
   */
  static getAll(): Readonly<Record<string, any>> {
    return _globalConfig;
  }

  private static loadConfigFile(filePath: string): void {
    if (!existsSync(filePath)) return;

    try {
      const content = readFileSync(filePath, 'utf-8');
      
      if (filePath.endsWith('.json')) {
        const json = JSON.parse(content);
        this.config = this.deepMerge(this.config, json);
      } else if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
        // 简单的 YAML 解析（支持基本格式）
        const yaml = this.parseSimpleYaml(content);
        this.config = this.deepMerge(this.config, yaml);
      }
    } catch (e) {
      console.warn(`[aiko-boot] Failed to load config file: ${filePath}`);
    }
  }

  /**
   * 异步加载 TypeScript/JavaScript 配置文件
   */
  private static async loadTsConfigFile(filePath: string): Promise<void> {
    if (!existsSync(filePath)) return;

    try {
      const { pathToFileURL } = await import('url');
      const fileUrl = pathToFileURL(filePath).href;
      const mod = await import(fileUrl);
      const config = mod.default || mod;
      
      if (config && typeof config === 'object') {
        this.config = this.deepMerge(this.config, config);
      }
    } catch (e) {
      console.warn(`[aiko-boot] Failed to load config file: ${filePath}`);
    }
  }

  private static loadFromEnv(prefix: string): void {
    for (const [key, value] of Object.entries(process.env)) {
      if (!key.startsWith(prefix)) continue;
      
      // APP_DATABASE_HOST -> database.host
      const configKey = key
        .slice(prefix.length)
        .toLowerCase()
        .replace(/_/g, '.');
      
      this.setNestedValue(this.config, configKey, this.parseEnvValue(value));
    }
  }

  private static parseEnvValue(value: string | undefined): any {
    if (value === undefined) return undefined;
    if (value === 'true') return true;
    if (value === 'false') return false;
    if (/^\d+$/.test(value)) return parseInt(value, 10);
    if (/^\d+\.\d+$/.test(value)) return parseFloat(value);
    return value;
  }

  private static getNestedValue(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private static setNestedValue(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    const target = keys.reduce((current, key) => {
      if (!(key in current)) current[key] = {};
      return current[key];
    }, obj);
    target[lastKey] = value;
  }

  private static deepMerge(target: Record<string, any>, source: Record<string, any>): Record<string, any> {
    const result = { ...target };
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this.deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    return result;
  }

  private static parseSimpleYaml(content: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = content.split('\n');
    const stack: Array<{ indent: number; obj: Record<string, any> }> = [{ indent: -1, obj: result }];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;

      const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
      if (!match) continue;

      const indent = match[1].length;
      const key = match[2].trim();
      const value = match[3].trim();

      // 找到正确的父级
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop();
      }

      const parent = stack[stack.length - 1].obj;

      if (value) {
        // 有值的行
        parent[key] = this.parseEnvValue(value.replace(/^['"]|['"]$/g, ''));
      } else {
        // 嵌套对象
        parent[key] = {};
        stack.push({ indent, obj: parent[key] });
      }
    }

    return result;
  }
}

/**
 * @ConfigurationProperties - 将配置绑定到类
 * 
 * @param prefix - 配置前缀，如 'database' 对应配置文件中的 database.* 属性
 * 
 * @example
 * ```typescript
 * @ConfigurationProperties('database')
 * export class DatabaseProperties {
 *   host: string = 'localhost';
 *   port: number = 5432;
 * }
 * 
 * // 配置文件 app.config.json:
 * // { "database": { "host": "127.0.0.1", "port": 3306 } }
 * ```
 */
export function ConfigurationProperties(prefix: string) {
  return function <T extends { new (...args: any[]): any }>(target: T) {
    Reflect.defineMetadata(CONFIG_PROPERTIES_METADATA, { prefix }, target);
    
    // 注册到全局列表
    configPropertiesClasses.push({ prefix, target });

    // Apply DI decorators
    Injectable()(target);
    Singleton()(target);

    // 包装构造函数，自动绑定配置
    const originalConstructor = target;
    const newConstructor = function (this: any, ...args: any[]) {
      const instance = new (originalConstructor as any)(...args);
      bindConfigToInstance(instance, prefix);
      return instance;
    } as unknown as T;

    newConstructor.prototype = originalConstructor.prototype;
    Object.setPrototypeOf(newConstructor, originalConstructor);

    // 复制 metadata
    const metadataKeys = Reflect.getMetadataKeys(originalConstructor);
    metadataKeys.forEach(key => {
      const value = Reflect.getMetadata(key, originalConstructor);
      Reflect.defineMetadata(key, value, newConstructor);
    });

    return newConstructor;
  };
}

/**
 * @Value - 注入单个配置值
 * 
 * @param key - 配置键，如 'database.host'
 * @param defaultValue - 默认值
 * 
 * @example
 * ```typescript
 * @Service()
 * export class MyService {
 *   @Value('server.port', 3000)
 *   private port!: number;
 * }
 * ```
 */
export function Value(key: string, defaultValue?: any) {
  return function (target: Object, propertyKey: string | symbol): void {
    const existingValues = Reflect.getMetadata(VALUE_METADATA, target.constructor) || [];
    existingValues.push({
      propertyKey: String(propertyKey),
      key,
      defaultValue,
    });
    Reflect.defineMetadata(VALUE_METADATA, existingValues, target.constructor);
  };
}

/**
 * 将配置绑定到实例
 */
function bindConfigToInstance(instance: any, prefix: string): void {
  const config = ConfigLoader.getPrefix(prefix);
  
  for (const [key, value] of Object.entries(config)) {
    if (key in instance || instance.hasOwnProperty(key)) {
      instance[key] = value;
    }
  }
}

/**
 * 为实例注入 @Value 属性
 */
export function injectValueProperties(instance: any): void {
  const valueProps = Reflect.getMetadata(VALUE_METADATA, instance.constructor) || [];
  
  for (const { propertyKey, key, defaultValue } of valueProps) {
    const value = ConfigLoader.get(key, defaultValue);
    if (value !== undefined) {
      instance[propertyKey] = value;
    }
  }
}

/**
 * 获取配置属性元数据
 */
export function getConfigurationPropertiesMetadata(target: any): { prefix: string } | undefined {
  return Reflect.getMetadata(CONFIG_PROPERTIES_METADATA, target);
}

/**
 * 获取所有已注册的配置属性类
 */
export function getConfigPropertiesClasses(): Array<{ prefix: string; target: Function }> {
  return configPropertiesClasses;
}

/**
 * 初始化所有配置属性类（在 createApp 中调用）
 */
export function initializeConfigurationProperties(): void {
  for (const { target } of configPropertiesClasses) {
    try {
      // 通过 DI 容器解析，触发构造函数中的配置绑定
      Container.resolve(target as any);
    } catch (e) {
      console.warn(`[aiko-boot] Failed to initialize configuration properties: ${(e as Error).message}`);
    }
  }
}
