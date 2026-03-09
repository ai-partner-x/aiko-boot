# Aiko Boot API 开发规范

本文档定义 Aiko Boot 框架中 API 开发的完整规范，包含组件开发、代码规范和 Java 转译要求。

> **重要**：本规范基于 `@ai-partner-x/eslint-plugin-aiko-boot` 的 `java-compat` 配置，确保 TypeScript 代码可转译为 Java Spring Boot。

## 目录

- [项目结构](#项目结构)
- [Entity 实体层](#entity-实体层)
- [Mapper 数据访问层](#mapper-数据访问层)
- [Service 服务层](#service-服务层)
- [Controller 控制器层](#controller-控制器层)
- [DTO 数据传输对象](#dto-数据传输对象)
- [ESLint Java 兼容规则](#eslint-java-兼容规则)
- [代码审查清单](#代码审查清单)

---

## 项目结构

```
src/
├── entity/           # 实体类 - 映射数据库表
│   └── user.entity.ts
├── mapper/           # 数据访问层 - 继承 BaseMapper
│   └── user.mapper.ts
├── service/          # 服务层 - 业务逻辑
│   └── user.service.ts
├── controller/       # 控制器层 - REST API
│   └── user.controller.ts
├── dto/              # 数据传输对象 - 请求/响应模型
│   └── user.dto.ts
└── server.ts         # 启动入口
```

### 文件命名规范

| 组件类型 | 文件命名 | 示例 |
|----------|----------|------|
| Entity | `{name}.entity.ts` | `user.entity.ts` |
| Mapper | `{name}.mapper.ts` | `user.mapper.ts` |
| Service | `{name}.service.ts` | `user.service.ts` |
| Controller | `{name}.controller.ts` | `user.controller.ts` |
| DTO | `{name}.dto.ts` | `user.dto.ts` |

---

## Entity 实体层

实体类映射数据库表结构，使用装饰器定义表名和字段映射。

### 完整示例

```typescript
// src/entity/user.entity.ts
import { Entity, TableId, TableField } from '@ai-partner-x/aiko-boot-starter-orm';

@Entity({ tableName: 'sys_user' })
export class User {
  @TableId({ type: 'AUTO' })
  id!: number;

  @TableField({ column: 'user_name' })
  username!: string;

  @TableField()
  email!: string;

  @TableField()
  age?: number;

  @TableField({ column: 'created_at' })
  createdAt?: Date;

  @TableField({ column: 'updated_at' })
  updatedAt?: Date;
}
```

### 装饰器说明

| 装饰器 | 用途 | 参数 |
|--------|------|------|
| `@Entity` | 标记实体类 | `tableName`: 数据库表名 |
| `@TableId` | 标记主键 | `type`: AUTO/INPUT/ASSIGN_ID |
| `@TableField` | 标记字段 | `column`: 数据库列名（可选） |

### 字段类型映射

| TypeScript | Java | SQL |
|------------|------|-----|
| `number` (id) | `Long` | `BIGINT` |
| `number` | `Integer` | `INT` |
| `string` | `String` | `VARCHAR` |
| `boolean` | `Boolean` | `BOOLEAN` |
| `Date` | `LocalDateTime` | `TIMESTAMP` |

---

## Mapper 数据访问层

Mapper 继承 `BaseMapper<T>`，自动获得 MyBatis-Plus 风格的 CRUD 方法。

### 完整示例

```typescript
// src/mapper/user.mapper.ts
import 'reflect-metadata';
import { Mapper, BaseMapper } from '@ai-partner-x/aiko-boot-starter-orm';
import { User } from '../entity/user.entity.js';

@Mapper(User)
export class UserMapper extends BaseMapper<User> {
  // 自定义查询方法
  async selectByUsername(username: string): Promise<User | null> {
    const users = await this.selectList({ username });
    return users.length > 0 ? users[0] : null;
  }

  async selectByEmail(email: string): Promise<User | null> {
    const users = await this.selectList({ email });
    return users.length > 0 ? users[0] : null;
  }
}
```

### BaseMapper 内置方法

| 方法 | 说明 | 返回类型 |
|------|------|----------|
| `selectById(id)` | 根据 ID 查询 | `T \| null` |
| `selectList(wrapper?)` | 条件查询列表 | `T[]` |
| `selectListByWrapper(wrapper)` | QueryWrapper 查询 | `T[]` |
| `selectCountByWrapper(wrapper)` | QueryWrapper 统计 | `number` |
| `insert(entity)` | 插入 | `number` |
| `updateById(entity)` | 根据 ID 更新 | `number` |
| `updateWithWrapper(wrapper)` | UpdateWrapper 更新 | `number` |
| `deleteById(id)` | 根据 ID 删除 | `number` |
| `deleteByWrapper(wrapper)` | QueryWrapper 删除 | `number` |

---

## Service 服务层

Service 层处理业务逻辑，使用 `@Autowired` 注入依赖，`@Transactional` 管理事务。

### 完整示例

```typescript
// src/service/user.service.ts
import 'reflect-metadata';
import { Service, Transactional, Autowired } from '@ai-partner-x/aiko-boot';
import { QueryWrapper, UpdateWrapper } from '@ai-partner-x/aiko-boot-starter-orm';
import { User } from '../entity/user.entity.js';
import { UserMapper } from '../mapper/user.mapper.js';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto.js';

/**
 * 用户搜索参数
 */
export interface UserSearchParams {
  username?: string;
  email?: string;
  minAge?: number;
  maxAge?: number;
  page?: number;
  pageSize?: number;
  orderBy?: string;
  orderDir?: string;
}

/**
 * 用户搜索结果
 */
export interface UserSearchResult {
  data: User[];
  total: number;
}

@Service()
export class UserService {
  @Autowired()
  private userMapper!: UserMapper;

  // ==================== 基础 CRUD ====================

  async getUserById(id: number): Promise<User | null> {
    return this.userMapper.selectById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userMapper.selectList();
  }

  @Transactional()
  async createUser(dto: CreateUserDto): Promise<User> {
    // 检查用户名是否已存在
    const existingWrapper = new QueryWrapper<User>().eq('username', dto.username);
    const existingList = await this.userMapper.selectListByWrapper(existingWrapper);
    if (existingList.length > 0) {
      throw new Error('用户名已存在');
    }

    const user: User = {
      id: 0,
      username: dto.username,
      email: dto.email,
      age: dto.age,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userMapper.insert(user);
    
    const newUserWrapper = new QueryWrapper<User>().eq('username', dto.username);
    const newUserList = await this.userMapper.selectListByWrapper(newUserWrapper);
    return newUserList[0];
  }

  @Transactional()
  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userMapper.selectById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.age !== undefined) user.age = dto.age;
    user.updatedAt = new Date();

    await this.userMapper.updateById(user);
    return (await this.userMapper.selectById(id))!;
  }

  @Transactional()
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userMapper.selectById(id);
    if (!user) {
      throw new Error('用户不存在');
    }
    const affected = await this.userMapper.deleteById(id);
    return affected > 0;
  }

  // ==================== QueryWrapper 高级查询 ====================

  /**
   * 使用 QueryWrapper 进行高级搜索
   */
  async searchUsers(params: UserSearchParams): Promise<UserSearchResult> {
    const username = params.username;
    const email = params.email;
    const minAge = params.minAge;
    const maxAge = params.maxAge;
    const page = params.page !== undefined ? params.page : 1;
    const pageSize = params.pageSize !== undefined ? params.pageSize : 10;
    const orderBy = params.orderBy !== undefined ? params.orderBy : 'id';
    const orderDir = params.orderDir !== undefined ? params.orderDir : 'desc';

    const wrapper = new QueryWrapper<User>();

    // 模糊搜索
    if (username) {
      wrapper.like('username', username);
    }
    if (email) {
      wrapper.like('email', email);
    }

    // 范围查询
    if (minAge !== undefined && maxAge !== undefined) {
      wrapper.between('age', minAge, maxAge);
    } else if (minAge !== undefined) {
      wrapper.ge('age', minAge);
    } else if (maxAge !== undefined) {
      wrapper.le('age', maxAge);
    }

    // 排序
    if (orderDir === 'asc') {
      wrapper.orderByAsc(orderBy as keyof User);
    } else {
      wrapper.orderByDesc(orderBy as keyof User);
    }

    // 分页
    wrapper.page(page, pageSize);

    const data = await this.userMapper.selectListByWrapper(wrapper);
    
    // 统计总数
    const countWrapper = new QueryWrapper<User>();
    if (username) countWrapper.like('username', username);
    if (email) countWrapper.like('email', email);
    if (minAge !== undefined && maxAge !== undefined) {
      countWrapper.between('age', minAge, maxAge);
    } else if (minAge !== undefined) {
      countWrapper.ge('age', minAge);
    } else if (maxAge !== undefined) {
      countWrapper.le('age', maxAge);
    }
    const total = await this.userMapper.selectCountByWrapper(countWrapper);

    const result: UserSearchResult = { data, total };
    return result;
  }

  /**
   * 使用 OR 条件查询
   */
  async searchByKeyword(keyword: string): Promise<User[]> {
    const wrapper = new QueryWrapper<User>()
      .or(w => w.like('username', keyword).like('email', keyword))
      .orderByDesc('id');
    
    return this.userMapper.selectListByWrapper(wrapper);
  }

  // ==================== UpdateWrapper 批量操作 ====================

  /**
   * 使用 UpdateWrapper 批量更新
   */
  @Transactional()
  async batchUpdateAge(usernameKeyword: string, newAge: number): Promise<number> {
    const wrapper = new UpdateWrapper<User>()
      .set('age', newAge)
      .set('updatedAt', new Date().toISOString())
      .like('username', usernameKeyword);
    
    return this.userMapper.updateWithWrapper(wrapper);
  }

  /**
   * 使用 QueryWrapper 批量删除
   */
  @Transactional()
  async batchDeleteByAgeRange(minAge: number, maxAge: number): Promise<number> {
    const wrapper = new QueryWrapper<User>()
      .between('age', minAge, maxAge);
    
    return this.userMapper.deleteByWrapper(wrapper);
  }
}
```

### QueryWrapper 方法

| 方法 | 说明 | 示例 |
|------|------|------|
| `eq(field, value)` | 等于 | `wrapper.eq('status', 1)` |
| `ne(field, value)` | 不等于 | `wrapper.ne('status', 0)` |
| `gt(field, value)` | 大于 | `wrapper.gt('age', 18)` |
| `ge(field, value)` | 大于等于 | `wrapper.ge('age', 18)` |
| `lt(field, value)` | 小于 | `wrapper.lt('age', 60)` |
| `le(field, value)` | 小于等于 | `wrapper.le('age', 60)` |
| `like(field, value)` | 模糊匹配 | `wrapper.like('name', 'test')` |
| `between(field, min, max)` | 范围 | `wrapper.between('age', 18, 60)` |
| `isNull(field)` | 为空 | `wrapper.isNull('email')` |
| `isNotNull(field)` | 不为空 | `wrapper.isNotNull('email')` |
| `orderByAsc(field)` | 升序 | `wrapper.orderByAsc('id')` |
| `orderByDesc(field)` | 降序 | `wrapper.orderByDesc('createdAt')` |
| `page(page, size)` | 分页 | `wrapper.page(1, 10)` |
| `or(callback)` | OR 条件 | `wrapper.or(w => w.eq(...))` |

---

## Controller 控制器层

Controller 层暴露 REST API 端点，使用 Spring Boot 风格的装饰器。

### 完整示例

```typescript
// src/controller/user.controller.ts
import 'reflect-metadata';
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
  RequestParam,
} from '@ai-partner-x/aiko-boot-starter-web';
import { Autowired } from '@ai-partner-x/aiko-boot';
import { User } from '../entity/user.entity.js';
import { UserService, UserSearchParams } from '../service/user.service.js';
import { 
  CreateUserDto, 
  UpdateUserDto,
  BatchUpdateAgeDto,
  BatchDeleteDto,
  SuccessResponse,
  UpdateResponse,
  DeleteResponse,
  UserSearchResultDto,
} from '../dto/user.dto.js';

@RestController({ path: '/users' })
export class UserController {
  @Autowired()
  private userService!: UserService;

  // ==================== 基础 CRUD ====================

  /**
   * 获取所有用户
   * GET /api/users
   */
  @GetMapping()
  async list(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  /**
   * 根据 ID 获取用户
   * GET /api/users/:id
   */
  @GetMapping('/:id')
  async getById(@PathVariable('id') id: string): Promise<User | null> {
    return this.userService.getUserById(Number(id));
  }

  /**
   * 创建用户
   * POST /api/users
   */
  @PostMapping()
  async create(@RequestBody() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  /**
   * 更新用户
   * PUT /api/users/:id
   */
  @PutMapping('/:id')
  async update(
    @PathVariable('id') id: string,
    @RequestBody() dto: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateUser(Number(id), dto);
  }

  /**
   * 删除用户
   * DELETE /api/users/:id
   */
  @DeleteMapping('/:id')
  async delete(@PathVariable('id') id: string): Promise<SuccessResponse> {
    const result = await this.userService.deleteUser(Number(id));
    const response: SuccessResponse = { success: result };
    return response;
  }

  // ==================== 高级查询 ====================

  /**
   * 高级搜索
   * GET /api/users/search?username=test&minAge=20&maxAge=30&page=1&pageSize=10
   */
  @GetMapping('/search')
  async search(
    @RequestParam('username') username?: string,
    @RequestParam('email') email?: string,
    @RequestParam('minAge') minAge?: string,
    @RequestParam('maxAge') maxAge?: string,
    @RequestParam('page') page?: string,
    @RequestParam('pageSize') pageSize?: string,
    @RequestParam('orderBy') orderBy?: string,
    @RequestParam('orderDir') orderDir?: string,
  ): Promise<UserSearchResultDto> {
    const params: UserSearchParams = {
      username,
      email,
      minAge: minAge ? Number(minAge) : undefined,
      maxAge: maxAge ? Number(maxAge) : undefined,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 10,
      orderBy: orderBy as UserSearchParams['orderBy'],
      orderDir: orderDir as UserSearchParams['orderDir'],
    };
    
    const result = await this.userService.searchUsers(params);
    const response: UserSearchResultDto = {
      data: result.data,
      total: result.total,
      page: params.page!,
      pageSize: params.pageSize!,
    };
    return response;
  }

  /**
   * 关键字搜索
   * GET /api/users/keyword/:keyword
   */
  @GetMapping('/keyword/:keyword')
  async searchByKeyword(@PathVariable('keyword') keyword: string): Promise<User[]> {
    return this.userService.searchByKeyword(keyword);
  }

  // ==================== 批量操作 ====================

  /**
   * 批量更新年龄
   * PUT /api/users/batch/age
   * Body: { "username": "test", "age": 30 }
   */
  @PutMapping('/batch/age')
  async batchUpdateAge(
    @RequestBody() body: BatchUpdateAgeDto,
  ): Promise<UpdateResponse> {
    const updated = await this.userService.batchUpdateAge(body.username, body.age);
    const response: UpdateResponse = { success: true, updated };
    return response;
  }

  /**
   * 批量删除
   * DELETE /api/users/batch
   * Body: { "minAge": 18, "maxAge": 25 }
   */
  @DeleteMapping('/batch')
  async batchDelete(
    @RequestBody() body: BatchDeleteDto,
  ): Promise<DeleteResponse> {
    const deleted = await this.userService.batchDeleteByAgeRange(body.minAge, body.maxAge);
    const response: DeleteResponse = { success: true, deleted };
    return response;
  }
}
```

### 路由装饰器

| 装饰器 | HTTP 方法 | 示例 |
|--------|-----------|------|
| `@GetMapping` | GET | `@GetMapping('/:id')` |
| `@PostMapping` | POST | `@PostMapping()` |
| `@PutMapping` | PUT | `@PutMapping('/:id')` |
| `@DeleteMapping` | DELETE | `@DeleteMapping('/:id')` |

### 参数绑定装饰器

| 装饰器 | 用途 | 示例 |
|--------|------|------|
| `@PathVariable` | 路径参数 | `@PathVariable('id') id: string` |
| `@RequestParam` | 查询参数 | `@RequestParam('page') page?: string` |
| `@RequestBody` | 请求体 | `@RequestBody() dto: CreateUserDto` |

---

## DTO 数据传输对象

DTO 用于定义请求和响应的数据结构，支持验证装饰器。

### 完整示例

```typescript
// src/dto/user.dto.ts
import { 
  IsNotEmpty, 
  IsEmail, 
  IsOptional, 
  Length, 
  Min, 
  Max, 
  IsInt 
} from '@ai-partner-x/aiko-boot-starter-validation';
import { User } from '../entity/user.entity.js';

// ==================== 请求 DTO ====================

/**
 * 创建用户请求
 */
export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(2, 50, { message: '用户名长度必须在 2-50 之间' })
  username!: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsOptional()
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  @Max(150, { message: '年龄不能大于 150' })
  age?: number;
}

/**
 * 更新用户请求
 */
export class UpdateUserDto {
  @IsOptional()
  @Length(2, 50)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}

/**
 * 批量更新年龄请求
 */
export class BatchUpdateAgeDto {
  @IsNotEmpty({ message: '用户名关键字不能为空' })
  username!: string;

  @IsNotEmpty({ message: '年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  @Max(150, { message: '年龄不能大于 150' })
  age!: number;
}

/**
 * 批量删除请求
 */
export class BatchDeleteDto {
  @IsNotEmpty({ message: '最小年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  minAge!: number;

  @IsNotEmpty({ message: '最大年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Max(150, { message: '年龄不能大于 150' })
  maxAge!: number;
}

// ==================== 响应 DTO ====================

/**
 * 操作成功响应
 */
export class SuccessResponse {
  success!: boolean;
}

/**
 * 更新操作响应
 */
export class UpdateResponse {
  success!: boolean;
  updated!: number;
}

/**
 * 删除操作响应
 */
export class DeleteResponse {
  success!: boolean;
  deleted!: number;
}

/**
 * 用户搜索结果
 */
export class UserSearchResultDto {
  data!: User[];
  total!: number;
  page!: number;
  pageSize!: number;
}
```

### 验证装饰器

| 装饰器 | 用途 | 示例 |
|--------|------|------|
| `@IsNotEmpty` | 非空 | `@IsNotEmpty({ message: '不能为空' })` |
| `@IsOptional` | 可选 | `@IsOptional()` |
| `@IsEmail` | 邮箱格式 | `@IsEmail({}, { message: '格式错误' })` |
| `@Length` | 字符串长度 | `@Length(2, 50)` |
| `@IsInt` | 整数 | `@IsInt()` |
| `@Min` | 最小值 | `@Min(0)` |
| `@Max` | 最大值 | `@Max(150)` |

---

## ESLint Java 兼容规则

为确保代码可转译为 Java，必须遵守以下 ESLint 规则。

### 配置

```bash
pnpm add -D @ai-partner-x/eslint-plugin-aiko-boot @typescript-eslint/parser
```

```json
{
  "extends": ["plugin:@ai-partner-x/aiko-boot/java-compat"]
}
```

### 规则列表

| 规则 | 说明 | 正确写法 | 错误写法 |
|------|------|----------|----------|
| `no-arrow-methods` | 禁止箭头函数方法 | `async getUser(): Promise<User>` | `getUser = async () => {}` |
| `no-destructuring-in-methods` | 禁止解构赋值 | `const name = dto.name;` | `const { name } = dto;` |
| `no-optional-chaining-in-methods` | 禁止可选链 | `if (user !== null) { return user.name; }` | `return user?.name;` |
| `no-nullish-coalescing` | 禁止空值合并 | `page !== undefined ? page : 1` | `page ?? 1` |
| `no-object-spread` | 禁止对象展开 | 逐个属性赋值 | `{ ...dto, id }` |
| `no-union-types` | 禁止联合类型 | `orderBy: string;` | `orderBy: 'asc' \| 'desc';` |
| `no-inline-object-types` | 禁止内联对象类型 | 定义独立接口 | `Promise<{ data: User[] }>` |
| `explicit-return-type` | 强制显式返回类型 | `async get(): Promise<User>` | `async get()` |
| `static-route-paths` | 强制静态路由 | `@GetMapping('/users')` | `@GetMapping(BASE_PATH)` |
| `require-rest-controller` | 要求控制器装饰器 | `@RestController({ path: '/api' })` | 缺少装饰器 |

### 常见错误修复

```typescript
// ❌ 解构赋值
const { username, email } = dto;
// ✅ 显式属性访问
const username = dto.username;
const email = dto.email;

// ❌ 空值合并
const page = params.page ?? 1;
// ✅ 三元运算符
const page = params.page !== undefined ? params.page : 1;

// ❌ 可选链
return user?.username;
// ✅ 显式 null 检查
if (user !== null) {
  return user.username;
}
return null;

// ❌ 直接返回对象字面量
return { success: true };
// ✅ 声明变量后返回
const response: SuccessResponse = { success: true };
return response;

// ❌ 联合类型
orderBy: 'asc' | 'desc';
// ✅ 基础类型 + 注释
orderBy: string;  // 'asc' | 'desc'
```

---

## 代码审查清单

### Entity
- [ ] 有 `@Entity` 装饰器，指定 `tableName`
- [ ] 主键有 `@TableId` 装饰器
- [ ] 所有字段有类型声明
- [ ] 字段使用 `!` 断言或 `?` 可选

### Mapper
- [ ] 有 `@Mapper(EntityClass)` 装饰器
- [ ] 继承 `BaseMapper<T>`

### Service
- [ ] 有 `@Service()` 装饰器
- [ ] 依赖使用 `@Autowired()` 注入
- [ ] 写操作有 `@Transactional()` 装饰器
- [ ] 所有方法有显式返回类型

### Controller
- [ ] 有 `@RestController({ path: '/xxx' })` 装饰器
- [ ] 路由路径为静态字符串
- [ ] 参数使用正确的绑定装饰器
- [ ] 响应对象使用变量声明后返回

### DTO
- [ ] 请求 DTO 有验证装饰器
- [ ] 响应 DTO 有明确的类型定义
- [ ] 无联合类型和内联对象类型

### Java 兼容
- [ ] 无箭头函数方法
- [ ] 无解构赋值
- [ ] 无可选链 `?.`
- [ ] 无空值合并 `??`
- [ ] 无对象展开 `...`

### 运行检查

```bash
# ESLint 检查
pnpm lint

# 生成 Java 代码
pnpm java

# 验证 Java 编译
cd gen && mvn compile
```
