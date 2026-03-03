/**
 * InMemory Adapter - 内存适配器
 * 用于开发和测试环境，无需真实数据库
 */

import type { IMapperAdapter, PageParams, PageResult, QueryCondition, OrderBy } from '../base-mapper.js';

export class InMemoryAdapter<T extends { id?: number | string }> implements IMapperAdapter<T> {
  private store = new Map<string, T>();
  private idCounter = 0;
  
  async findById(id: number | string): Promise<T | null> {
    return this.store.get(String(id)) || null;
  }
  
  async findByIds(ids: (number | string)[]): Promise<T[]> {
    return ids.map(id => this.store.get(String(id))).filter((item): item is T => item !== undefined);
  }
  
  async findOne(condition: QueryCondition<T>): Promise<T | null> {
    return Array.from(this.store.values()).find(item => this.matchesCondition(item, condition)) || null;
  }
  
  async findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]> {
    let items = Array.from(this.store.values()).filter(item => this.matchesCondition(item, condition));
    if (orderBy?.length) items = this.sortItems(items, orderBy);
    return items;
  }
  
  async findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>> {
    let items = Array.from(this.store.values()).filter(item => this.matchesCondition(item, condition));
    if (orderBy?.length) items = this.sortItems(items, orderBy);
    const total = items.length;
    const offset = (page.pageNo - 1) * page.pageSize;
    return {
      records: items.slice(offset, offset + page.pageSize),
      total,
      pageNo: page.pageNo,
      pageSize: page.pageSize,
      totalPages: Math.ceil(total / page.pageSize),
    };
  }
  
  async count(condition: QueryCondition<T>): Promise<number> {
    return Array.from(this.store.values()).filter(item => this.matchesCondition(item, condition)).length;
  }
  
  async insert(entity: T): Promise<T> {
    const id = entity.id ?? ++this.idCounter;
    const newEntity = { ...entity, id } as T;
    this.store.set(String(id), newEntity);
    return newEntity;
  }
  
  async insertBatch(entities: T[]): Promise<T[]> {
    return Promise.all(entities.map(e => this.insert(e)));
  }
  
  async updateById(id: number | string, data: Partial<T>): Promise<T> {
    const existing = this.store.get(String(id));
    if (!existing) {
      throw new Error('Entity with id ' + id + ' not found');
    }
    const updated = { ...existing, ...data, id } as T;
    this.store.set(String(id), updated);
    return updated;
  }
  
  async updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number> {
    let count = 0;
    for (const [key, item] of this.store.entries()) {
      if (this.matchesCondition(item, condition)) {
        this.store.set(key, { ...item, ...data });
        count++;
      }
    }
    return count;
  }
  
  async deleteById(id: number | string): Promise<boolean> {
    return this.store.delete(String(id));
  }
  
  async deleteByIds(ids: (number | string)[]): Promise<number> {
    let count = 0;
    for (const id of ids) {
      if (this.store.delete(String(id))) count++;
    }
    return count;
  }
  
  async deleteByCondition(condition: QueryCondition<T>): Promise<number> {
    let count = 0;
    for (const [key, item] of this.store.entries()) {
      if (this.matchesCondition(item, condition)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }
  
  private matchesCondition(item: T, condition: QueryCondition<T>): boolean {
    if (!condition || Object.keys(condition).length === 0) return true;
    for (const key in condition) {
      if ((item as Record<string, unknown>)[key] !== condition[key]) return false;
    }
    return true;
  }
  
  private sortItems(items: T[], orderBy: OrderBy[]): T[] {
    return items.sort((a, b) => {
      for (const { field, direction } of orderBy) {
        const aVal = (a as Record<string, unknown>)[field];
        const bVal = (b as Record<string, unknown>)[field];
        if (aVal! < bVal!) return direction === 'asc' ? -1 : 1;
        if (aVal! > bVal!) return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }
  
  clear(): void {
    this.store.clear();
    this.idCounter = 0;
  }
  
  importData(data: T[]): void {
    data.forEach(item => item.id && this.store.set(String(item.id), item));
  }
  
  exportData(): T[] {
    return Array.from(this.store.values());
  }
}
