/**
 * @ai-partner-x/aiko-boot-starter-orm
 * 
 * Spring Boot Style ORM Starter with MyBatis-Plus compatible API
 * 
 * Features:
 * - Auto-configuration based on database.* config
 * - MyBatis-Plus style decorators (@Entity, @TableId, @TableField, @Mapper)
 * - BaseMapper with CRUD operations
 * - QueryWrapper for dynamic queries
 * - Multi-database support (PostgreSQL, SQLite, MySQL)
 */

// Config
export {
  setDatabaseConfig,
  getDatabaseConfig,
  createAdapterFromEntity,
  type DatabaseConfig,
} from './config.js';

// Decorators
export {
  Entity,
  TableName,
  TableId,
  TableField,
  Column,
  Mapper,
  type EntityOptions,
  type TableIdOptions,
  type TableFieldOptions,
  type MapperOptions,
  getEntityMetadata,
  getTableIdMetadata,
  getTableFieldMetadata,
  getMapperMetadata,
  ENTITY_METADATA,
  TABLE_ID_METADATA,
  TABLE_FIELD_METADATA,
  MAPPER_METADATA,
} from './decorators.js';

// BaseMapper
export {
  BaseMapper,
  type IMapperAdapter,
  type PageParams,
  type PageResult,
  type QueryCondition,
  type OrderBy,
} from './base-mapper.js';

// QueryWrapper (MyBatis-Plus 风格)
export {
  QueryWrapper,
  LambdaQueryWrapper,
  UpdateWrapper,
  LambdaUpdateWrapper,
  type Condition,
  type OrderByClause,
  type CompareOperator,
  type SetClause,
} from './wrapper.js';

// Adapters
export { KyselyAdapter, type KyselyAdapterOptions, InMemoryAdapter } from './adapters/index.js';

// Database Factory (多数据库支持)
export {
  createKyselyDatabase,
  getKyselyDatabase,
  getKyselyDatabaseConfig,
  closeKyselyDatabase,
  isDatabaseInitialized,
  type DatabaseType,
  type DatabaseConnectionConfig,
  type PostgresConnectionConfig,
  type SqliteConnectionConfig,
  type MysqlConnectionConfig,
} from './database.js';

// Auto Configuration
export {
  OrmAutoConfiguration,
  DatabaseProperties,
} from './auto-configuration.js';

// Config Augmentation (扩展 @ai-partner-x/aiko-boot 的 AppConfig)
import './config-augment.js';
