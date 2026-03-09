/**
 * KyselyAdapter - 基于 Kysely 的数据库适配器
 * 
 * 将 MyBatis-Plus 风格的 QueryWrapper 转换为 Kysely 查询
 * 支持 PostgreSQL、SQLite、MySQL 等多种数据库
 */

import { Kysely, sql } from 'kysely';
import type { IMapperAdapter, PageParams, PageResult, QueryCondition, OrderBy } from '../base-mapper.js';
import type { QueryWrapper, Condition } from '../wrapper.js';

export interface KyselyAdapterOptions {
  /** 表名 */
  tableName: string;
  /** Kysely 实例 */
  db: Kysely<any>;
  /** 字段映射：TypeScript 字段名 -> 数据库列名 */
  fieldMapping?: Record<string, string>;
}

/**
 * KyselyAdapter<T> - Kysely 数据库适配器
 */
export class KyselyAdapter<T extends { id?: number | string }> implements IMapperAdapter<T> {
  private db: Kysely<any>;
  private tableName: string;
  private fieldMapping: Record<string, string>;
  private reverseMapping: Record<string, string>;

  constructor(options: KyselyAdapterOptions) {
    this.db = options.db;
    this.tableName = options.tableName;
    this.fieldMapping = options.fieldMapping || {};
    this.reverseMapping = Object.fromEntries(
      Object.entries(this.fieldMapping).map(([k, v]) => [v, k])
    );
  }

  // ==================== 字段映射 ====================

  private toColumn(field: string): string {
    return this.fieldMapping[field] || field;
  }

  private toField(column: string): string {
    return this.reverseMapping[column] || column;
  }

  private toEntity(row: Record<string, unknown>): T {
    const entity: Record<string, unknown> = {};
    for (const [col, val] of Object.entries(row)) {
      entity[this.toField(col)] = val;
    }
    return entity as T;
  }

  private toRow(entity: Partial<T>): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const [field, val] of Object.entries(entity)) {
      if (val !== undefined) {
        row[this.toColumn(field)] = val;
      }
    }
    return row;
  }

  // ==================== 基础查询 ====================

  async findById(id: number | string): Promise<T | null> {
    const result = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();
    
    return result ? this.toEntity(result as Record<string, unknown>) : null;
  }

  async findByIds(ids: (number | string)[]): Promise<T[]> {
    if (ids.length === 0) return [];
    
    const results = await this.db
      .selectFrom(this.tableName)
      .selectAll()
      .where('id', 'in', ids)
      .execute();
    
    return results.map(row => this.toEntity(row as Record<string, unknown>));
  }

  async findOne(condition: QueryCondition<T>): Promise<T | null> {
    let query = this.db.selectFrom(this.tableName).selectAll();
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
      }
    }
    
    const result = await query.executeTakeFirst();
    return result ? this.toEntity(result as Record<string, unknown>) : null;
  }

  async findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]> {
    let query = this.db.selectFrom(this.tableName).selectAll();
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
      }
    }
    
    if (orderBy) {
      for (const { field, direction } of orderBy) {
        query = query.orderBy(this.toColumn(field), direction);
      }
    }
    
    const results = await query.execute();
    return results.map(row => this.toEntity(row as Record<string, unknown>));
  }

  async findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>> {
    let query = this.db.selectFrom(this.tableName).selectAll();
    let countQuery = this.db.selectFrom(this.tableName).select(sql`COUNT(*)`.as('count'));
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
        countQuery = countQuery.where(this.toColumn(field), '=', value);
      }
    }
    
    if (orderBy) {
      for (const { field, direction } of orderBy) {
        query = query.orderBy(this.toColumn(field), direction);
      }
    }
    
    const offset = (page.pageNo - 1) * page.pageSize;
    query = query.limit(page.pageSize).offset(offset);
    
    const [results, countResult] = await Promise.all([
      query.execute(),
      countQuery.executeTakeFirst(),
    ]);
    
    const total = Number((countResult as any)?.count || 0);
    
    return {
      records: results.map(row => this.toEntity(row as Record<string, unknown>)),
      total,
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize),
    };
  }

  async count(condition: QueryCondition<T>): Promise<number> {
    let query = this.db.selectFrom(this.tableName).select(sql`COUNT(*)`.as('count'));
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
      }
    }
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.count || 0);
  }

  // ==================== Wrapper 查询（MyBatis-Plus 风格）====================

  /**
   * 使用 QueryWrapper 查询列表
   */
  async selectListByWrapper(wrapper: QueryWrapper<T>): Promise<T[]> {
    let query = this.db.selectFrom(this.tableName).selectAll();
    
    // 应用条件
    query = this.applyConditions(query, wrapper.getConditions());
    
    // 应用排序
    for (const { column, direction } of wrapper.getOrderBy()) {
      query = query.orderBy(this.toColumn(column), direction);
    }
    
    // 应用分页
    const limit = wrapper.getLimit();
    const offset = wrapper.getOffset();
    if (limit !== undefined) {
      query = query.limit(limit);
    }
    if (offset !== undefined) {
      query = query.offset(offset);
    }
    
    const results = await query.execute();
    return results.map(row => this.toEntity(row as Record<string, unknown>));
  }

  /**
   * 使用 QueryWrapper 查询单条
   */
  async selectOneByWrapper(wrapper: QueryWrapper<T>): Promise<T | null> {
    const results = await this.selectListByWrapper(wrapper.limit(1));
    return results.length > 0 ? results[0] : null;
  }

  /**
   * 使用 QueryWrapper 查询数量
   */
  async selectCountByWrapper(wrapper: QueryWrapper<T>): Promise<number> {
    let query = this.db.selectFrom(this.tableName).select(sql`COUNT(*)`.as('count'));
    query = this.applyConditions(query, wrapper.getConditions()) as any;
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.count || 0);
  }

  /**
   * 使用 QueryWrapper 更新
   */
  async updateByWrapper(data: Partial<T>, wrapper: QueryWrapper<T>): Promise<number> {
    const row = this.toRow(data);
    delete row.id;
    
    let query = this.db.updateTable(this.tableName).set(row);
    query = this.applyConditions(query, wrapper.getConditions()) as any;
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.numUpdatedRows || 0);
  }

  /**
   * 使用 QueryWrapper 删除
   */
  async deleteByWrapper(wrapper: QueryWrapper<T>): Promise<number> {
    let query = this.db.deleteFrom(this.tableName);
    query = this.applyConditions(query, wrapper.getConditions()) as any;
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.numDeletedRows || 0);
  }

  /**
   * 应用 Wrapper 条件到 Kysely 查询
   */
  private applyConditions<Q>(query: Q, conditions: Condition[]): Q {
    let q = query as any;
    
    for (const condition of conditions) {
      switch (condition.type) {
        case 'compare':
          if (condition.operator === 'like' || condition.operator === 'not like') {
            q = q.where(this.toColumn(condition.column!), condition.operator, condition.value);
          } else {
            q = q.where(this.toColumn(condition.column!), condition.operator!, condition.value);
          }
          break;
          
        case 'between':
          q = q.where(this.toColumn(condition.column!), '>=', condition.values![0])
               .where(this.toColumn(condition.column!), '<=', condition.values![1]);
          break;
          
        case 'in':
          q = q.where(this.toColumn(condition.column!), condition.operator === 'not in' ? 'not in' : 'in', condition.values);
          break;
          
        case 'null':
          if (condition.operator === 'is null') {
            q = q.where(this.toColumn(condition.column!), 'is', null);
          } else {
            q = q.where(this.toColumn(condition.column!), 'is not', null);
          }
          break;
          
        case 'or':
          if (condition.conditions && condition.conditions.length > 0) {
            q = q.where((eb: any) => {
              const orConditions = condition.conditions!.map(c => this.buildExpressionFromCondition(eb, c));
              return eb.or(orConditions);
            });
          }
          break;
          
        case 'and':
          if (condition.conditions && condition.conditions.length > 0) {
            q = q.where((eb: any) => {
              const andConditions = condition.conditions!.map(c => this.buildExpressionFromCondition(eb, c));
              return eb.and(andConditions);
            });
          }
          break;
      }
    }
    
    return q as Q;
  }

  /**
   * 构建 Kysely 表达式
   */
  private buildExpressionFromCondition(eb: any, condition: Condition): any {
    switch (condition.type) {
      case 'compare':
        return eb(this.toColumn(condition.column!), condition.operator!, condition.value);
      case 'between':
        return eb.and([
          eb(this.toColumn(condition.column!), '>=', condition.values![0]),
          eb(this.toColumn(condition.column!), '<=', condition.values![1]),
        ]);
      case 'in':
        return eb(this.toColumn(condition.column!), condition.operator === 'not in' ? 'not in' : 'in', condition.values);
      case 'null':
        return condition.operator === 'is null' 
          ? eb(this.toColumn(condition.column!), 'is', null)
          : eb(this.toColumn(condition.column!), 'is not', null);
      default:
        return eb.lit(true);
    }
  }

  // ==================== 插入操作 ====================

  async insert(entity: T): Promise<number> {
    const row = this.toRow(entity);
    delete row.id;
    
    const result = await this.db
      .insertInto(this.tableName)
      .values(row)
      .executeTakeFirst();
    
    return Number((result as any)?.numInsertedOrUpdatedRows || 1);
  }

  async insertBatch(entities: T[]): Promise<number> {
    const rows = entities.map(e => {
      const row = this.toRow(e);
      delete row.id;
      return row;
    });
    
    const result = await this.db
      .insertInto(this.tableName)
      .values(rows)
      .executeTakeFirst();
    
    return Number((result as any)?.numInsertedOrUpdatedRows || rows.length);
  }

  // ==================== 更新操作 ====================

  async updateById(id: number | string, data: Partial<T>): Promise<number> {
    const row = this.toRow(data);
    delete row.id;
    
    const result = await this.db
      .updateTable(this.tableName)
      .set(row)
      .where('id', '=', id)
      .executeTakeFirst();
    
    return Number((result as any)?.numUpdatedRows || 0);
  }

  async updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number> {
    const row = this.toRow(data);
    delete row.id;
    
    let query = this.db.updateTable(this.tableName).set(row);
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
      }
    }
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.numUpdatedRows || 0);
  }

  // ==================== 删除操作 ====================

  async deleteById(id: number | string): Promise<number> {
    const result = await this.db
      .deleteFrom(this.tableName)
      .where('id', '=', id)
      .executeTakeFirst();
    
    return Number((result as any)?.numDeletedRows || 0);
  }

  async deleteByIds(ids: (number | string)[]): Promise<number> {
    if (ids.length === 0) return 0;
    
    const result = await this.db
      .deleteFrom(this.tableName)
      .where('id', 'in', ids)
      .executeTakeFirst();
    
    return Number((result as any)?.numDeletedRows || 0);
  }

  async deleteByCondition(condition: QueryCondition<T>): Promise<number> {
    let query = this.db.deleteFrom(this.tableName);
    
    for (const [field, value] of Object.entries(condition)) {
      if (value !== undefined) {
        query = query.where(this.toColumn(field), '=', value);
      }
    }
    
    const result = await query.executeTakeFirst();
    return Number((result as any)?.numDeletedRows || 0);
  }
}
