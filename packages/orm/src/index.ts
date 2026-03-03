/**
 * @ai-first/orm
 * 
 * ORM framework with MyBatis-Plus compatible decorators
 */

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

// Adapters
export { InMemoryAdapter } from './adapters/index.js';
export { PostgresAdapter, type PostgresConfig, type PostgresAdapterOptions } from './adapters/index.js';
