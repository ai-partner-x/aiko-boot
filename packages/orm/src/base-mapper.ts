/**
 * BaseMapper - MyBatis-Plus 风格的基础 Mapper
 * 
 * 提供常用的 CRUD 操作，类似于 MyBatis-Plus 的 BaseMapper<T>
 * 运行时通过适配器执行实际的数据库操作
 */

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
 * @Mapper({ entity: User })
 * class UserMapper extends BaseMapper<User> {}
 * 
 * // 使用
 * const user = await userMapper.selectById(1);
 * const users = await userMapper.selectList({ status: 'ACTIVE' });
 * await userMapper.insert(newUser);
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
   */
  async insert(entity: Omit<T, 'id'> & { id?: number | string }): Promise<T> {
    return this.getAdapter().insert(entity as T);
  }
  
  /**
   * 批量插入
   * 
   * 对应 MyBatis-Plus: insertBatch (扩展方法)
   */
  async insertBatch(entities: (Omit<T, 'id'> & { id?: number | string })[]): Promise<T[]> {
    return this.getAdapter().insertBatch(entities as T[]);
  }
  
  // ==================== 更新操作 ====================
  
  /**
   * 根据 ID 更新
   * 
   * 对应 MyBatis-Plus: updateById
   */
  async updateById(entity: T): Promise<T> {
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
   */
  async deleteById(id: number | string): Promise<boolean> {
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
}

// ==================== Adapter Interface ====================

/**
 * Mapper 适配器接口
 * 
 * 不同的 ORM 实现此接口来提供实际的数据库操作
 */
export interface IMapperAdapter<T> {
  // 查询
  findById(id: number | string): Promise<T | null>;
  findByIds(ids: (number | string)[]): Promise<T[]>;
  findOne(condition: QueryCondition<T>): Promise<T | null>;
  findList(condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<T[]>;
  findPage(page: PageParams, condition: QueryCondition<T>, orderBy?: OrderBy[]): Promise<PageResult<T>>;
  count(condition: QueryCondition<T>): Promise<number>;
  
  // 插入
  insert(entity: T): Promise<T>;
  insertBatch(entities: T[]): Promise<T[]>;
  
  // 更新
  updateById(id: number | string, data: Partial<T>): Promise<T>;
  updateByCondition(data: Partial<T>, condition: QueryCondition<T>): Promise<number>;
  
  // 删除
  deleteById(id: number | string): Promise<boolean>;
  deleteByIds(ids: (number | string)[]): Promise<number>;
  deleteByCondition(condition: QueryCondition<T>): Promise<number>;
}
