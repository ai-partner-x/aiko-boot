/**
 * ORM Auto Configuration - Spring Boot 风格自动配置
 * 
 * 根据配置文件自动初始化数据库连接
 * 
 * @example
 * ```json
 * // app.config.json
 * {
 *   "database": {
 *     "type": "sqlite",
 *     "filename": "./data/app.db"
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
  OnApplicationShutdown,
  ConfigLoader,
} from '@ai-partner-x/aiko-boot/boot';
import { Component } from '@ai-partner-x/aiko-boot';
import { createKyselyDatabase, closeKyselyDatabase, type DatabaseConnectionConfig } from './database.js';

/**
 * 数据库配置属性类
 * 
 * 对应配置文件中的 database.* 配置
 */
@ConfigurationProperties('database')
export class DatabaseProperties {
  /** 数据库类型: postgres | sqlite | mysql */
  type?: 'postgres' | 'sqlite' | 'mysql';
  
  // SQLite
  /** SQLite 数据库文件路径 */
  filename?: string;
  
  // PostgreSQL / MySQL
  /** 数据库主机 */
  host?: string;
  /** 数据库端口 */
  port?: number;
  /** 数据库用户名 */
  user?: string;
  /** 数据库密码 */
  password?: string;
  /** 数据库名称 */
  database?: string;
}

/**
 * ORM 自动配置类
 * 
 * 当配置了 database.type 时自动初始化数据库连接
 */
@AutoConfiguration({ order: 10 })
@ConditionalOnProperty('database.type')
@Component()
export class OrmAutoConfiguration {
  private kyselyInstance: any = null;

  /**
   * 应用启动时初始化数据库连接
   */
  @OnApplicationReady({ order: -100 })
  async initializeDatabase(): Promise<void> {
    const config = this.buildDatabaseConfig();
    if (!config) {
      console.warn('[aiko-orm] Database configuration incomplete, skipping initialization');
      return;
    }

    console.log(`🗄️  [aiko-orm] Initializing ${config.type} database...`);
    this.kyselyInstance = await createKyselyDatabase(config);
    console.log(`✅ [aiko-orm] Database connected`);
  }

  /**
   * 应用关闭时断开数据库连接
   */
  @OnApplicationShutdown({ order: 100 })
  async closeDatabase(): Promise<void> {
    if (this.kyselyInstance) {
      console.log('🗄️  [aiko-orm] Closing database connection...');
      await closeKyselyDatabase();
      console.log('✅ [aiko-orm] Database disconnected');
    }
  }

  /**
   * 从配置构建数据库连接配置
   */
  private buildDatabaseConfig(): DatabaseConnectionConfig | null {
    const type = ConfigLoader.get<string>('database.type');
    
    if (!type) return null;

    switch (type) {
      case 'sqlite': {
        const filename = ConfigLoader.get<string>('database.filename');
        if (!filename) return null;
        return { type: 'sqlite', filename };
      }
      
      case 'postgres':
      case 'mysql': {
        const host = ConfigLoader.get<string>('database.host');
        const port = ConfigLoader.get<number>('database.port');
        const user = ConfigLoader.get<string>('database.user');
        const password = ConfigLoader.get<string>('database.password');
        const database = ConfigLoader.get<string>('database.database');
        
        if (!host || !port || !user || !database) return null;
        
        return {
          type,
          host,
          port,
          user,
          password: password || '',
          database,
        } as DatabaseConnectionConfig;
      }
      
      default:
        return null;
    }
  }
}
