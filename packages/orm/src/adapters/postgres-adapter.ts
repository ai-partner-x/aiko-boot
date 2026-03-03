/**
 * PostgreSQL Adapter - PostgreSQL 数据库适配器
 */

import type { IMapperAdapter, PageParams, PageResult, QueryCondition, OrderBy } from '../base-mapper.js';

export interface PostgresConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface PostgresAdapterOptions {
  tableName: string;
  config: PostgresConfig;
  fieldMapping?: Record<string, string>; // TS 字段名 -> 数据库列名
}

export class PostgresAdapter<T extends { id?: number | string }> implements IMapperAdapter<T> {
  private pool: any;
  private tableName: string;
  private fieldMapping: Record<string, string>;
  private reverseMapping: Record<string, string>;
  private initialized = false;
  private config: PostgresConfig;

  constructor(options: PostgresAdapterOptions) {
    this.tableName = options.tableName;
    this.config = options.config;
    this.fieldMapping = options.fieldMapping || {};
    this.reverseMapping = Object.fromEntries(
      Object.entries(this.fieldMapping).map(([k, v]) => [v, k])
    );
  }

  private async getPool() {
    if (!this.initialized) {
      const pg = await import('pg');
      this.pool = new pg.default.Pool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
      });
      this.initialized = true;
    }
    return this.pool;
  }

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

  async findById(id: number | string): Promise<T | null> {
    const pool = await this.getPool();
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rows.length > 0 ? this.toEntity(result.rows[0]) : null;
  }

  async findByIds(ids: (number | string)[]): Promise<T[]> {
    if (ids.length === 0) return [];
    const pool = await this.getPool();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(
      `SELECT * FROM ${this.tableName} WHERE id IN (${placeholders})`,
      ids
    );
    return result.rows.map((row: Record<string, unknown>) => this.toEntity(row));
  }

  async findOne(condition: QueryCondition<T>): Promise<T | null> {
    const pool = await this.getPool();
    const { where, values } = this.buildWhere(condition);
    const result = await pool.query(
      `SELECT * FROM ${this.tableName}${where} LIMIT 1`,
      values
    );
    return result.rows.length > 0 ? this.toEntity(result.rows[0]) : null;
  }

  async findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]> {
    const pool = await this.getPool();
    const { where, values } = this.buildWhere(condition);
    const order = this.buildOrderBy(orderBy);
    const result = await pool.query(
      `SELECT * FROM ${this.tableName}${where}${order}`,
      values
    );
    return result.rows.map((row: Record<string, unknown>) => this.toEntity(row));
  }

  async findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>> {
    const pool = await this.getPool();
    const { where, values } = this.buildWhere(condition);
    const order = this.buildOrderBy(orderBy);
    const offset = (page.pageNo - 1) * page.pageSize;

    const [dataResult, countResult] = await Promise.all([
      pool.query(
        `SELECT * FROM ${this.tableName}${where}${order} LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
        [...values, page.pageSize, offset]
      ),
      pool.query(
        `SELECT COUNT(*) as count FROM ${this.tableName}${where}`,
        values
      ),
    ]);

    const total = parseInt(countResult.rows[0].count, 10);
    return {
      records: dataResult.rows.map((row: Record<string, unknown>) => this.toEntity(row)),
      total,
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize),
    };
  }

  async count(condition: QueryCondition<T>): Promise<number> {
    const pool = await this.getPool();
    const { where, values } = this.buildWhere(condition);
    const result = await pool.query(
      `SELECT COUNT(*) as count FROM ${this.tableName}${where}`,
      values
    );
    return parseInt(result.rows[0].count, 10);
  }

  async insert(entity: T): Promise<T> {
    const pool = await this.getPool();
    const row = this.toRow(entity);
    delete row.id;

    const columns = Object.keys(row);
    const values = Object.values(row);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');

    const result = await pool.query(
      `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    return this.toEntity(result.rows[0]);
  }

  async insertBatch(entities: T[]): Promise<T[]> {
    return Promise.all(entities.map(e => this.insert(e)));
  }

  async updateById(id: number | string, data: Partial<T>): Promise<T> {
    const pool = await this.getPool();
    const row = this.toRow(data);
    delete row.id;

    const setClauses = Object.keys(row).map((col, i) => `${col} = $${i + 1}`);
    const values = [...Object.values(row), id];

    const result = await pool.query(
      `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      throw new Error(`Entity with id ${id} not found`);
    }
    return this.toEntity(result.rows[0]);
  }

  async updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number> {
    const pool = await this.getPool();
    const row = this.toRow(data);
    const { where, values: condValues } = this.buildWhere(condition);

    const setClauses = Object.keys(row).map((col, i) => `${col} = $${i + 1}`);
    const values = [...Object.values(row), ...condValues];

    const adjustedWhere = where.replace(/\$(\d+)/g, (_, num) => 
      `$${parseInt(num) + Object.keys(row).length}`
    );

    const result = await pool.query(
      `UPDATE ${this.tableName} SET ${setClauses.join(', ')}${adjustedWhere}`,
      values
    );
    return result.rowCount || 0;
  }

  async deleteById(id: number | string): Promise<boolean> {
    const pool = await this.getPool();
    const result = await pool.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return (result.rowCount || 0) > 0;
  }

  async deleteByIds(ids: (number | string)[]): Promise<number> {
    if (ids.length === 0) return 0;
    const pool = await this.getPool();
    const placeholders = ids.map((_, i) => `$${i + 1}`).join(', ');
    const result = await pool.query(
      `DELETE FROM ${this.tableName} WHERE id IN (${placeholders})`,
      ids
    );
    return result.rowCount || 0;
  }

  async deleteByCondition(condition: QueryCondition<T>): Promise<number> {
    const pool = await this.getPool();
    const { where, values } = this.buildWhere(condition);
    const result = await pool.query(
      `DELETE FROM ${this.tableName}${where}`,
      values
    );
    return result.rowCount || 0;
  }

  private buildWhere(condition: QueryCondition<T>): { where: string; values: unknown[] } {
    const entries = Object.entries(condition || {}).filter(([_, v]) => v !== undefined);
    if (entries.length === 0) {
      return { where: '', values: [] };
    }
    const clauses = entries.map(([field], i) => `${this.toColumn(field)} = $${i + 1}`);
    return {
      where: ` WHERE ${clauses.join(' AND ')}`,
      values: entries.map(([_, v]) => v),
    };
  }

  private buildOrderBy(orderBy?: OrderBy[]): string {
    if (!orderBy?.length) return '';
    const clauses = orderBy.map(({ field, direction }) => 
      `${this.toColumn(field)} ${direction.toUpperCase()}`
    );
    return ` ORDER BY ${clauses.join(', ')}`;
  }

  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}
