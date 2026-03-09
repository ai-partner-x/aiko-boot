/**
 * ORM 全局配置
 * 
 * 在 createApp 时设置数据库配置，Mapper 自动获取适配器
 */
import { KyselyAdapter } from './adapters/index.js';
import { getKyselyDatabase, isDatabaseInitialized } from './database.js';
import { getEntityMetadata, getTableFieldMetadata, getTableIdMetadata } from './decorators.js';

/** 数据库配置（已废弃，请使用 createKyselyDatabase） */
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

// 全局数据库配置（已废弃）
let globalDatabaseConfig: DatabaseConfig | null = null;

/**
 * 设置全局数据库配置
 * @deprecated 请使用 createKyselyDatabase() 替代
 */
export function setDatabaseConfig(config: DatabaseConfig): void {
  globalDatabaseConfig = config;
}

/**
 * 获取全局数据库配置
 * @deprecated 请使用 getKyselyDatabaseConfig() 替代
 */
export function getDatabaseConfig(): DatabaseConfig | null {
  return globalDatabaseConfig;
}

/**
 * 从 Entity 的 @Entity/@TableField 装饰器自动创建数据库适配器
 * 表名和字段映射全部从 Entity metadata 获取
 */
export function createAdapterFromEntity<T extends { id?: number | string }>(
  entityClass: new (...args: any[]) => T
): KyselyAdapter<T> {
  if (!isDatabaseInitialized()) {
    throw new Error('[aiko-orm] Database not initialized. Call createKyselyDatabase() first.');
  }
  
  // 从 @Entity 获取表名
  const entityMeta = getEntityMetadata(entityClass);
  const tableName = entityMeta?.tableName || entityClass.name.toLowerCase() + 's';
  
  // 从 @TableField 获取字段映射
  const fieldMeta = getTableFieldMetadata(entityClass) || {};
  const idMeta = getTableIdMetadata(entityClass) || {};
  
  const fieldMapping: Record<string, string> = {};
  
  for (const [propName, field] of Object.entries(fieldMeta)) {
    if (field.column && field.column !== propName) {
      fieldMapping[propName] = field.column;
    }
  }
  
  for (const [propName, field] of Object.entries(idMeta)) {
    if (field.column && field.column !== propName) {
      fieldMapping[propName] = field.column;
    }
  }
  
  return new KyselyAdapter<T>({
    tableName,
    db: getKyselyDatabase(),
    fieldMapping: Object.keys(fieldMapping).length > 0 ? fieldMapping : undefined,
  });
}
