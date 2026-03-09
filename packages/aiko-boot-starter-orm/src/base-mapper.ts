/**
 * BaseMapper - MyBatis-Plus 风格的基础 Mapper
 * 
 * 提供常用的 CRUD 操作，类似于 MyBatis-Plus 的 BaseMapper<T>
 * 运行时通过适配器执行实际的数据库操作
 */

import type { QueryWrapper } from './wrapper.js';
import type { UpdateWrapper } from './wrapper.js';

// ==================== Types ====================

/** 分页参数 */
export interface PageParams {
  pageNo: number;
  pageSize: number;
}

/** 分页结果 */
export interface PageResult<T> {
  records: T[];
  total: number;
  pageNo: number;
  pageSize: number;
  totalPages: number;
}

/** 查询条件 */
export type QueryCondition<T> = Partial<T>;

/** 排序 */
export interface OrderBy {
  field: string;
  direction: 'asc' | 'desc';
}

// ==================== BaseMapper ====================

/**
 * BaseMapper<T> - 基础 Mapper 接口
 * 
 * 类似于 MyBatis-Plus 的 BaseMapper，提供标准 CRUD 操作
 * 
 * @example
 * ```typescript
 * // 开发时简洁写法
 * @Mapper()
 * class UserMapper extends BaseMapper<User> {}
 * 
 * // 构建后自动转换为
 * @Mapper(User)
 * class UserMapper extends BaseMapper<User> {}
 * ```
 */
export abstract class BaseMapper<T extends { id?: number | string }> {
  protected adapter: IMapperAdapter<T> | null = null;
  
  /**
   * 设置适配器
   */
  setAdapter(adapter: IMapperAdapter<T>): void {
    this.adapter = adapter;
  }
  
  /**
   * 获取适配器（子类可覆盖）
   */
  protected getAdapter(): IMapperAdapter<T> {
    if (!this.adapter) {
      throw new Error('Mapper adapter not set. Call setAdapter() first or use dependency injection.');
    }
    return this.adapter;
  }
  
  // ==================== 查询操作 ====================
  
  /**
   * 根据 ID 查询
   * 
   * 对应 MyBatis-Plus: selectById
   */
  async selectById(id: number | string): Promise<T | null> {
    return this.getAdapter().findById(id);
  }
  
  /**
   * 根据 ID 批量查询
   * 
   * 对应 MyBatis-Plus: selectBatchIds
   */
  async selectBatchIds(ids: (number | string)[]): Promise<T[]> {
    return this.getAdapter().findByIds(ids);
  }
  
  /**
   * 根据条件查询单条
   * 
   * 对应 MyBatis-Plus: selectOne
   */
  async selectOne(condition: QueryCondition<T>): Promise<T | null> {
    return this.getAdapter().findOne(condition);
  }
  
  /**
   * 根据条件查询列表
   * 
   * 对应 MyBatis-Plus: selectList
   */
  async selectList(condition?: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]> {
    return this.getAdapter().findList(condition || {}, orderBy);
  }
  
  /**
   * 分页查询
   * 
   * 对应 MyBatis-Plus: selectPage
   */
  async selectPage(page: PageParams, condition?: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>> {
    return this.getAdapter().findPage(page, condition || {}, orderBy);
  }
  
  /**
   * 查询总数
   * 
   * 对应 MyBatis-Plus: selectCount
   */
  async selectCount(condition?: QueryCondition<T>): Promise<number> {
    return this.getAdapter().count(condition || {});
  }
  
  // ==================== 插入操作 ====================
  
  /**
   * 插入单条记录
   * 
   * 对应 MyBatis-Plus: insert
   * @returns 影响行数
   */
  async insert(entity: Omit<T, 'id'> & { id?: number | string }): Promise<number> {
    return this.getAdapter().insert(entity as T);
  }
  
  /**
   * 批量插入
   * 
   * 对应 MyBatis-Plus: insertBatch (扩展方法)
   * @returns 影响行数
   */
  async insertBatch(entities: (Omit<T, 'id'> & { id?: number | string })[]): Promise<number> {
    return this.getAdapter().insertBatch(entities as T[]);
  }
  
  // ==================== 更新操作 ====================
  
  /**
   * 根据 ID 更新
   * 
   * 对应 MyBatis-Plus: updateById
   * @returns 影响行数
   */
  async updateById(entity: T): Promise<number> {
    if (!entity.id) {
      throw new Error('Entity must have an id for updateById');
    }
    return this.getAdapter().updateById(entity.id, entity);
  }
  
  /**
   * 根据条件更新
   * 
   * 对应 MyBatis-Plus: update
   */
  async update(data: Partial<T>, condition: QueryCondition<T>): Promise<number> {
    return this.getAdapter().updateByCondition(data, condition);
  }
  
  // ==================== 删除操作 ====================
  
  /**
   * 根据 ID 删除
   * 
   * 对应 MyBatis-Plus: deleteById
   * @returns 影响行数
   */
  async deleteById(id: number | string): Promise<number> {
    return this.getAdapter().deleteById(id);
  }
  
  /**
   * 根据 ID 批量删除
   * 
   * 对应 MyBatis-Plus: deleteBatchIds
   */
  async deleteBatchIds(ids: (number | string)[]): Promise<number> {
    return this.getAdapter().deleteByIds(ids);
  }
  
  /**
   * 根据条件删除
   * 
   * 对应 MyBatis-Plus: delete
   */
  async delete(condition: QueryCondition<T>): Promise<number> {
    return this.getAdapter().deleteByCondition(condition);
  }

  // ==================== QueryWrapper 查询（MyBatis-Plus 风格）====================

  /**
   * 使用 QueryWrapper 查询列表
   * 
   * @example
   * ```typescript
   * const users = await userMapper.selectList(
   *   new QueryWrapper<User>()
   *     .eq('status', 1)
   *     .gt('age', 18)
   *     .orderByDesc('createdAt')
   * );
   * ```
   */
  async selectListByWrapper(wrapper: QueryWrapper<T>): Promise<T[]> {
    const adapter = this.getAdapter() as any;
    if (typeof adapter.selectListByWrapper === 'function') {
      return adapter.selectListByWrapper(wrapper);
    }
    // 回退到普通查询（仅支持简单条件）
    console.warn('[BaseMapper] Adapter does not support QueryWrapper, falling back to simple query');
    return this.selectList({});
  }

  /**
   * 使用 QueryWrapper 查询单条
   * 
   * @example
   * ```typescript
   * const user = await userMapper.selectOneByWrapper(
   *   new QueryWrapper<User>().eq('email', 'test@test.com')
   * );
   * ```
   */
  async selectOneByWrapper(wrapper: QueryWrapper<T>): Promise<T | null> {
    const adapter = this.getAdapter() as any;
    if (typeof adapter.selectOneByWrapper === 'function') {
      return adapter.selectOneByWrapper(wrapper);
    }
    const list = await this.selectListByWrapper(wrapper.limit(1));
    return list.length > 0 ? list[0] : null;
  }

  /**
   * 使用 QueryWrapper 查询数量
   * 
   * @example
   * ```typescript
   * const count = await userMapper.selectCountByWrapper(
   *   new QueryWrapper<User>().eq('status', 1)
   * );
   * ```
   */
  async selectCountByWrapper(wrapper: QueryWrapper<T>): Promise<number> {
    const adapter = this.getAdapter() as any;
    if (typeof adapter.selectCountByWrapper === 'function') {
      return adapter.selectCountByWrapper(wrapper);
    }
    const list = await this.selectListByWrapper(wrapper);
    return list.length;
  }

  /**
   * 使用 QueryWrapper 更新
   * 
   * @example
   * ```typescript
   * const count = await userMapper.updateByWrapper(
   *   { status: 0 },
   *   new QueryWrapper<User>().lt('lastLoginAt', thirtyDaysAgo)
   * );
   * ```
   */
  async updateByWrapper(data: Partial<T>, wrapper: QueryWrapper<T>): Promise<number> {
    const adapter = this.getAdapter() as any;
    if (typeof adapter.updateByWrapper === 'function') {
      return adapter.updateByWrapper(data, wrapper);
    }
    throw new Error('Adapter does not support updateByWrapper');
  }

  /**
   * 使用 UpdateWrapper 更新（MyBatis-Plus 风格）
   * 
   * UpdateWrapper 可以同时指定更新的字段和条件
   * 
   * @example
   * ```typescript
   * // 使用 UpdateWrapper 的 set 方法
   * const count = await userMapper.updateWithWrapper(
   *   new UpdateWrapper<User>()
   *     .set('age', 30)
   *     .set('email', 'new@test.com')
   *     .eq('username', 'test')
   * );
   * 
   * // 相当于 SQL: UPDATE user SET age=30, email='new@test.com' WHERE username='test'
   * ```
   */
  async updateWithWrapper(wrapper: UpdateWrapper<T>): Promise<number>;
  async updateWithWrapper(entity: T | null, wrapper: UpdateWrapper<T>): Promise<number>;
  async updateWithWrapper(entityOrWrapper: T | UpdateWrapper<T> | null, wrapper?: UpdateWrapper<T>): Promise<number> {
    const adapter = this.getAdapter() as any;
    
    let updateWrapper: UpdateWrapper<T>;
    let entityData: Partial<T> | null = null;
    
    // 判断调用方式
    if (wrapper) {
      // updateWithWrapper(entity, wrapper) 形式
      entityData = entityOrWrapper as T | null;
      updateWrapper = wrapper;
    } else {
      // updateWithWrapper(wrapper) 形式
      updateWrapper = entityOrWrapper as UpdateWrapper<T>;
    }
    
    // 合并 entity 数据和 wrapper.set 数据
    const setData = updateWrapper.getSetData();
    const finalData = entityData ? { ...entityData, ...setData } : setData;
    
    if (typeof adapter.updateByWrapper === 'function') {
      return adapter.updateByWrapper(finalData, updateWrapper);
    }
    throw new Error('Adapter does not support updateByWrapper');
  }

  /**
   * 使用 QueryWrapper 删除
   * 
   * @example
   * ```typescript
   * const count = await userMapper.deleteByWrapper(
   *   new QueryWrapper<User>().eq('status', -1)
   * );
   * ```
   */
  async deleteByWrapper(wrapper: QueryWrapper<T>): Promise<number> {
    const adapter = this.getAdapter() as any;
    if (typeof adapter.deleteByWrapper === 'function') {
      return adapter.deleteByWrapper(wrapper);
    }
    throw new Error('Adapter does not support deleteByWrapper');
  }
}

// ==================== Adapter Interface ====================

/**
 * Mapper 适配器接口
 * 
 * 不同的 ORM 实现此接口来提供实际的数据库操作
 * 返回值与 MyBatis-Plus 保持一致
 */
export interface IMapperAdapter<T> {
  // 查询
  findById(id: number | string): Promise<T | null>;
  findByIds(ids: (number | string)[]): Promise<T[]>;
  findOne(condition: QueryCondition<T>): Promise<T | null>;
  findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]>;
  findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>>;
  count(condition: QueryCondition<T>): Promise<number>;
  
  // 插入 - 返回影响行数
  insert(entity: T): Promise<number>;
  insertBatch(entities: T[]): Promise<number>;
  
  // 更新 - 返回影响行数
  updateById(id: number | string, data: Partial<T>): Promise<number>;
  updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number>;
  
  // 删除 - 返回影响行数
  deleteById(id: number | string): Promise<number>;
  deleteByIds(ids: (number | string)[]): Promise<number>;
  deleteByCondition(condition: QueryCondition<T>): Promise<number>;
}
