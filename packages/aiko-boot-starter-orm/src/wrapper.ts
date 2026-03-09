/**
 * QueryWrapper - MyBatis-Plus 风格的条件构造器
 * 
 * 提供与 Java MyBatis-Plus 完全一致的 API，底层转换为 Kysely 查询
 * 
 * @example
 * ```typescript
 * // TypeScript
 * const users = await userMapper.selectList(
 *   new QueryWrapper<User>()
 *     .eq('name', '张三')
 *     .gt('age', 18)
 *     .orderByDesc('createdAt')
 * );
 * 
 * // 对应 Java MyBatis-Plus
 * List<User> users = userMapper.selectList(
 *   new QueryWrapper<User>()
 *     .eq("name", "张三")
 *     .gt("age", 18)
 *     .orderByDesc("createdAt")
 * );
 * ```
 */

export type CompareOperator = '=' | '!=' | '>' | '>=' | '<' | '<=' | 'like' | 'not like' | 'in' | 'not in' | 'between' | 'is null' | 'is not null';

export interface Condition {
  type: 'compare' | 'between' | 'in' | 'null' | 'or' | 'and' | 'nested';
  column?: string;
  operator?: CompareOperator;
  value?: unknown;
  values?: unknown[];
  conditions?: Condition[];
}

export interface OrderByClause {
  column: string;
  direction: 'asc' | 'desc';
}

export interface SelectClause {
  columns: string[];
}

/**
 * QueryWrapper<T> - MyBatis-Plus 风格条件构造器
 */
export class QueryWrapper<T = any> {
  protected conditions: Condition[] = [];
  protected orderByClauses: OrderByClause[] = [];
  protected selectColumns: string[] = [];
  protected limitValue?: number;
  protected offsetValue?: number;
  protected groupByColumns: string[] = [];

  // ==================== 比较条件 ====================

  /**
   * 等于 =
   * @example wrapper.eq('name', '张三')
   */
  eq(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '=', value });
    return this;
  }

  /**
   * 不等于 !=
   * @example wrapper.ne('status', 0)
   */
  ne(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '!=', value });
    return this;
  }

  /**
   * 大于 >
   * @example wrapper.gt('age', 18)
   */
  gt(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '>', value });
    return this;
  }

  /**
   * 大于等于 >=
   * @example wrapper.ge('age', 18)
   */
  ge(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '>=', value });
    return this;
  }

  /**
   * 小于 <
   * @example wrapper.lt('age', 60)
   */
  lt(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '<', value });
    return this;
  }

  /**
   * 小于等于 <=
   * @example wrapper.le('age', 60)
   */
  le(column: keyof T & string, value: unknown): this {
    this.conditions.push({ type: 'compare', column, operator: '<=', value });
    return this;
  }

  // ==================== 模糊查询 ====================

  /**
   * LIKE '%value%'
   * @example wrapper.like('name', '张')
   */
  like(column: keyof T & string, value: string): this {
    this.conditions.push({ type: 'compare', column, operator: 'like', value: `%${value}%` });
    return this;
  }

  /**
   * NOT LIKE '%value%'
   * @example wrapper.notLike('name', '张')
   */
  notLike(column: keyof T & string, value: string): this {
    this.conditions.push({ type: 'compare', column, operator: 'not like', value: `%${value}%` });
    return this;
  }

  /**
   * LIKE 'value%'
   * @example wrapper.likeLeft('name', '张')
   */
  likeLeft(column: keyof T & string, value: string): this {
    this.conditions.push({ type: 'compare', column, operator: 'like', value: `%${value}` });
    return this;
  }

  /**
   * LIKE '%value'
   * @example wrapper.likeRight('name', '张')
   */
  likeRight(column: keyof T & string, value: string): this {
    this.conditions.push({ type: 'compare', column, operator: 'like', value: `${value}%` });
    return this;
  }

  // ==================== 范围查询 ====================

  /**
   * BETWEEN value1 AND value2
   * @example wrapper.between('age', 18, 30)
   */
  between(column: keyof T & string, value1: unknown, value2: unknown): this {
    this.conditions.push({ type: 'between', column, values: [value1, value2] });
    return this;
  }

  /**
   * NOT BETWEEN value1 AND value2
   * @example wrapper.notBetween('age', 18, 30)
   */
  notBetween(column: keyof T & string, value1: unknown, value2: unknown): this {
    this.conditions.push({ type: 'between', column, operator: 'not like', values: [value1, value2] });
    return this;
  }

  /**
   * IN (value1, value2, ...)
   * @example wrapper.in('status', [1, 2, 3])
   */
  in(column: keyof T & string, values: unknown[]): this {
    this.conditions.push({ type: 'in', column, operator: 'in', values });
    return this;
  }

  /**
   * NOT IN (value1, value2, ...)
   * @example wrapper.notIn('status', [0, -1])
   */
  notIn(column: keyof T & string, values: unknown[]): this {
    this.conditions.push({ type: 'in', column, operator: 'not in', values });
    return this;
  }

  // ==================== NULL 判断 ====================

  /**
   * IS NULL
   * @example wrapper.isNull('deletedAt')
   */
  isNull(column: keyof T & string): this {
    this.conditions.push({ type: 'null', column, operator: 'is null' });
    return this;
  }

  /**
   * IS NOT NULL
   * @example wrapper.isNotNull('email')
   */
  isNotNull(column: keyof T & string): this {
    this.conditions.push({ type: 'null', column, operator: 'is not null' });
    return this;
  }

  // ==================== 逻辑组合 ====================

  /**
   * OR 嵌套条件
   * @example wrapper.or(w => w.eq('name', '张三').eq('name', '李四'))
   */
  or(callback: (wrapper: QueryWrapper<T>) => QueryWrapper<T>): this {
    const nested = new QueryWrapper<T>();
    callback(nested);
    this.conditions.push({ type: 'or', conditions: nested.getConditions() });
    return this;
  }

  /**
   * AND 嵌套条件
   * @example wrapper.and(w => w.gt('age', 18).lt('age', 30))
   */
  and(callback: (wrapper: QueryWrapper<T>) => QueryWrapper<T>): this {
    const nested = new QueryWrapper<T>();
    callback(nested);
    this.conditions.push({ type: 'and', conditions: nested.getConditions() });
    return this;
  }

  // ==================== 排序 ====================

  /**
   * ORDER BY column ASC
   * @example wrapper.orderByAsc('createdAt')
   */
  orderByAsc(column: keyof T & string): this {
    this.orderByClauses.push({ column, direction: 'asc' });
    return this;
  }

  /**
   * ORDER BY column DESC
   * @example wrapper.orderByDesc('createdAt')
   */
  orderByDesc(column: keyof T & string): this {
    this.orderByClauses.push({ column, direction: 'desc' });
    return this;
  }

  /**
   * ORDER BY column direction
   * @example wrapper.orderBy('createdAt', 'desc')
   */
  orderBy(column: keyof T & string, direction: 'asc' | 'desc' = 'asc'): this {
    this.orderByClauses.push({ column, direction });
    return this;
  }

  // ==================== 分页 ====================

  /**
   * LIMIT
   * @example wrapper.limit(10)
   */
  limit(value: number): this {
    this.limitValue = value;
    return this;
  }

  /**
   * OFFSET
   * @example wrapper.offset(20)
   */
  offset(value: number): this {
    this.offsetValue = value;
    return this;
  }

  /**
   * 分页（等同于 limit + offset）
   * @example wrapper.page(2, 10) // 第2页，每页10条
   */
  page(pageNo: number, pageSize: number): this {
    this.limitValue = pageSize;
    this.offsetValue = (pageNo - 1) * pageSize;
    return this;
  }

  // ==================== 选择字段 ====================

  /**
   * SELECT columns
   * @example wrapper.select('id', 'name', 'email')
   */
  select(...columns: (keyof T & string)[]): this {
    this.selectColumns.push(...columns);
    return this;
  }

  /**
   * GROUP BY columns
   * @example wrapper.groupBy('status', 'type')
   */
  groupBy(...columns: (keyof T & string)[]): this {
    this.groupByColumns.push(...columns);
    return this;
  }

  // ==================== 获取构建结果 ====================

  getConditions(): Condition[] {
    return this.conditions;
  }

  getOrderBy(): OrderByClause[] {
    return this.orderByClauses;
  }

  getSelect(): string[] {
    return this.selectColumns;
  }

  getLimit(): number | undefined {
    return this.limitValue;
  }

  getOffset(): number | undefined {
    return this.offsetValue;
  }

  getGroupBy(): string[] {
    return this.groupByColumns;
  }

  /**
   * 清空所有条件
   */
  clear(): this {
    this.conditions = [];
    this.orderByClauses = [];
    this.selectColumns = [];
    this.limitValue = undefined;
    this.offsetValue = undefined;
    this.groupByColumns = [];
    return this;
  }
}

/**
 * LambdaQueryWrapper<T> - 类型安全的条件构造器（别名）
 * 
 * 在 TypeScript 中，QueryWrapper 已经是类型安全的，
 * 这里提供别名以保持与 Java MyBatis-Plus 的 API 一致性
 */
export class LambdaQueryWrapper<T = any> extends QueryWrapper<T> {}

// ==================== UpdateWrapper ====================

/**
 * 更新字段设置
 */
export interface SetClause {
  column: string;
  value: unknown;
}

/**
 * UpdateWrapper<T> - MyBatis-Plus 风格的更新条件构造器
 * 
 * 提供与 Java MyBatis-Plus 完全一致的 API，用于构建 UPDATE 语句
 * 
 * @example
 * ```typescript
 * // TypeScript
 * await userMapper.updateByWrapper(
 *   new UpdateWrapper<User>()
 *     .set('age', 30)
 *     .set('email', 'new@test.com')
 *     .eq('username', 'test')
 * );
 * 
 * // 对应 Java MyBatis-Plus
 * userMapper.update(null, new UpdateWrapper<User>()
 *     .set("age", 30)
 *     .set("email", "new@test.com")
 *     .eq("username", "test")
 * );
 * // SQL: UPDATE user SET age=30, email='new@test.com' WHERE username='test'
 * ```
 */
export class UpdateWrapper<T = any> extends QueryWrapper<T> {
  protected setClauses: SetClause[] = [];

  /**
   * 设置要更新的字段值
   * @example wrapper.set('age', 30)
   */
  set(column: keyof T & string, value: unknown): this {
    this.setClauses.push({ column, value });
    return this;
  }

  /**
   * 条件设置字段值（仅当 condition 为 true 时设置）
   * @example wrapper.set(user.age !== undefined, 'age', user.age)
   */
  setIf(condition: boolean, column: keyof T & string, value: unknown): this {
    if (condition) {
      this.setClauses.push({ column, value });
    }
    return this;
  }

  /**
   * 设置自增
   * @example wrapper.setIncr('viewCount', 1)  // viewCount = viewCount + 1
   */
  setIncr(column: keyof T & string, increment: number = 1): this {
    this.setClauses.push({ column, value: { $incr: increment } });
    return this;
  }

  /**
   * 设置自减
   * @example wrapper.setDecr('stock', 1)  // stock = stock - 1
   */
  setDecr(column: keyof T & string, decrement: number = 1): this {
    this.setClauses.push({ column, value: { $decr: decrement } });
    return this;
  }

  /**
   * 设置为 NULL
   * @example wrapper.setNull('deletedAt')
   */
  setNull(column: keyof T & string): this {
    this.setClauses.push({ column, value: null });
    return this;
  }

  /**
   * 获取所有 SET 子句
   */
  getSetClauses(): SetClause[] {
    return this.setClauses;
  }

  /**
   * 获取 SET 子句转换为普通对象
   */
  getSetData(): Partial<T> {
    const data: Record<string, unknown> = {};
    for (const clause of this.setClauses) {
      data[clause.column] = clause.value;
    }
    return data as Partial<T>;
  }

  /**
   * 清空所有条件和设置
   */
  clear(): this {
    super.clear();
    this.setClauses = [];
    return this;
  }
}

/**
 * LambdaUpdateWrapper<T> - 类型安全的更新条件构造器（别名）
 */
export class LambdaUpdateWrapper<T = any> extends UpdateWrapper<T> {}
