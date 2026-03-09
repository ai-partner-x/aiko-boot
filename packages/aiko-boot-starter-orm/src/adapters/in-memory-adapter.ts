/**
 * InMemoryAdapter - 内存适配器
 * 
 * 用于测试和开发环境，将数据存储在内存中
 */

import type { IMapperAdapter, PageParams, PageResult, QueryCondition, OrderBy } from '../base-mapper.js';

export class InMemoryAdapter<T extends Record<string, unknown>> implements IMapperAdapter<T> {
  private data: Map<number | string, T> = new Map();
  private autoIncrementId = 1;
  private idField = 'id';

  constructor(options?: { idField?: string }) {
    if (options?.idField) {
      this.idField = options.idField;
    }
  }

  async findById(id: number | string): Promise<T | null> {
    return this.data.get(id) ?? null;
  }

  async findByIds(ids: (number | string)[]): Promise<T[]> {
    return ids.map(id => this.data.get(id)).filter((item): item is T => item !== undefined);
  }

  async findOne(condition: QueryCondition<T>): Promise<T | null> {
    for (const item of this.data.values()) {
      if (this.matchCondition(item, condition)) {
        return item;
      }
    }
    return null;
  }

  async findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]> {
    let result = Array.from(this.data.values()).filter(item => this.matchCondition(item, condition));
    
    if (orderBy && orderBy.length > 0) {
      result = this.sortItems(result, orderBy);
    }
    
    return result;
  }

  async findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>> {
    const allItems = await this.findList(condition, orderBy);
    const total = allItems.length;
    const pageNo = page.pageNo ?? 1;
    const pageSize = page.pageSize ?? 10;
    const start = (pageNo - 1) * pageSize;
    const records = allItems.slice(start, start + pageSize);
    
    return {
      records,
      total,
      pageNo,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async count(condition: QueryCondition<T>): Promise<number> {
    return Array.from(this.data.values()).filter(item => this.matchCondition(item, condition)).length;
  }

  async insert(entity: T): Promise<number> {
    const id = (entity as Record<string, unknown>)[this.idField] ?? this.autoIncrementId++;
    const newEntity = { ...entity, [this.idField]: id } as T;
    this.data.set(id as number | string, newEntity);
    return 1; // 影响行数
  }

  async insertBatch(entities: T[]): Promise<number> {
    let count = 0;
    for (const entity of entities) {
      await this.insert(entity);
      count++;
    }
    return count; // 影响行数
  }

  async updateById(id: number | string, data: Partial<T>): Promise<number> {
    const existing = this.data.get(id);
    if (!existing) {
      return 0; // 未找到，影响 0 行
    }
    const updated = { ...existing, ...data, [this.idField]: id } as T;
    this.data.set(id, updated);
    return 1; // 影响行数
  }

  async updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number> {
    let count = 0;
    for (const [id, item] of this.data.entries()) {
      if (this.matchCondition(item, condition)) {
        this.data.set(id, { ...item, ...data } as T);
        count++;
      }
    }
    return count;
  }

  async deleteById(id: number | string): Promise<number> {
    return this.data.delete(id) ? 1 : 0; // 影响行数
  }

  async deleteByIds(ids: (number | string)[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.data.delete(id)) {
        count++;
      }
    }
    return count;
  }

  async deleteByCondition(condition: QueryCondition<T>): Promise<number> {
    let count = 0;
    for (const [id, item] of this.data.entries()) {
      if (this.matchCondition(item, condition)) {
        this.data.delete(id);
        count++;
      }
    }
    return count;
  }

  // 清空所有数据（测试用）
  clear(): void {
    this.data.clear();
    this.autoIncrementId = 1;
  }

  // 获取所有数据（测试用）
  getAll(): T[] {
    return Array.from(this.data.values());
  }

  private matchCondition(item: T, condition: QueryCondition<T>): boolean {
    if (!condition || Object.keys(condition).length === 0) {
      return true;
    }
    
    for (const [key, value] of Object.entries(condition)) {
      if ((item as Record<string, unknown>)[key] !== value) {
        return false;
      }
    }
    return true;
  }

  private sortItems(items: T[], orderBy: OrderBy[]): T[] {
    return [...items].sort((a, b) => {
      for (const order of orderBy) {
        const aVal = (a as Record<string, unknown>)[order.field] as string | number | null;
        const bVal = (b as Record<string, unknown>)[order.field] as string | number | null;
        
        let comparison = 0;
        if (aVal != null && bVal != null) {
          if (aVal < bVal) comparison = -1;
          else if (aVal > bVal) comparison = 1;
        }
        
        if (comparison !== 0) {
          return order.direction === 'desc' ? -comparison : comparison;
        }
      }
      return 0;
    });
  }
}
