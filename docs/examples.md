# AI-First Framework 示例项目

## 概览

| 示例 | 描述 | 技术栈 |
|------|------|--------|
| user-crud | 用户管理 CRUD 应用 | Next.js + shadcn/ui + 全栈分层架构 |
| cache-example | 缓存组件使用示例 | Node.js + @ai-first/cache + 可选 Redis |

---

## user-crud - 用户管理示例

一个完整的用户增删改查示例，展示 AI-First Framework 的核心用法。

### 功能特性

- ✅ 用户列表展示
- ✅ 新增用户（表单校验）
- ✅ 编辑用户
- ✅ 删除用户
- ✅ 依赖注入
- ✅ 数据校验
- ✅ RESTful API

### 技术栈

```
前端: React 19 + Next.js 16 + shadcn/ui + Tailwind CSS
后端: Next.js API Routes + Controller + Service + Mapper
校验: class-validator + react-hook-form + zod
状态: React Hooks
```

### 目录结构

```
user-crud/
├── src/
│   ├── api/                          # 后端代码
│   │   ├── controller/
│   │   │   └── user.controller.ts    # REST 控制器
│   │   ├── service/
│   │   │   └── user.service.ts       # 业务逻辑
│   │   ├── mapper/
│   │   │   └── user.mapper.ts        # 数据访问
│   │   ├── entity/
│   │   │   └── user.entity.ts        # 数据库实体
│   │   └── dto/
│   │       └── user.dto.ts           # 数据传输对象
│   │
│   ├── app/                          # Next.js 页面
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # 主页面
│   │   └── api/[...path]/
│   │       └── route.ts              # ⚡ 自动生成
│   │
│   ├── components/                   # React 组件
│   │   ├── ui/                       # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── table.tsx
│   │   │   └── sonner.tsx
│   │   ├── user-table.tsx            # 用户列表组件
│   │   └── user-form.tsx             # 用户表单组件
│   │
│   └── lib/
│       └── utils.ts                  # 工具函数
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

### 核心代码示例

#### 1. Entity - 数据库实体

```typescript
// src/api/entity/user.entity.ts
import { Entity, TableId, TableField } from '@ai-first/orm';

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

#### 2. DTO - 数据传输对象

```typescript
// src/api/dto/user.dto.ts
import { IsNotEmpty, IsEmail, IsOptional, Length, Min, Max, IsInt } from '@ai-first/validation';

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
```

#### 3. Mapper - 数据访问层

```typescript
// src/api/mapper/user.mapper.ts
import { Mapper, BaseMapper, InMemoryAdapter } from '@ai-first/orm';
import { Injectable, Singleton } from '@ai-first/di/server';
import { User } from '../entity/user.entity';

@Injectable()
@Singleton()
@Mapper(User)
export class UserMapper extends BaseMapper<User> {
  constructor() {
    super();
    this.setAdapter(new InMemoryAdapter<User>());
  }

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

#### 4. Service - 业务逻辑层

```typescript
// src/api/service/user.service.ts
import { Service, Transactional } from '@ai-first/core';
import { validateDto } from '@ai-first/validation';
import { User } from '../entity/user.entity';
import { UserMapper } from '../mapper/user.mapper';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@Service({ name: 'userService' })
export class UserService {
  constructor(private userMapper: UserMapper) {}

  async getAllUsers(): Promise<User[]> {
    return this.userMapper.selectList();
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userMapper.selectById(id);
  }

  @Transactional()
  async createUser(dto: CreateUserDto): Promise<User> {
    const result = await validateDto(CreateUserDto, dto);
    if (!result.success) {
      throw new Error(result.errors?.map(e => e.message).join(', '));
    }

    const existing = await this.userMapper.selectByUsername(dto.username);
    if (existing) {
      throw new Error('用户名已存在');
    }

    return this.userMapper.insert({
      username: dto.username,
      email: dto.email,
      age: dto.age,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User);
  }

  @Transactional()
  async updateUser(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');

    if (dto.username !== undefined) user.username = dto.username;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.age !== undefined) user.age = dto.age;
    user.updatedAt = new Date();

    return this.userMapper.updateById(user);
  }

  @Transactional()
  async deleteUser(id: number): Promise<boolean> {
    const user = await this.userMapper.selectById(id);
    if (!user) throw new Error('用户不存在');
    return this.userMapper.deleteById(id);
  }
}
```

#### 5. Controller - REST 控制器

```typescript
// src/api/controller/user.controller.ts
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
} from '@ai-first/nextjs';
import { User } from '../entity/user.entity';
import { UserService } from '../service/user.service';
import { CreateUserDto, UpdateUserDto } from '../dto/user.dto';

@RestController({ path: '/users' })
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping()
  async list(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @GetMapping('/:id')
  async getById(@PathVariable('id') id: string): Promise<User | null> {
    return this.userService.getUserById(Number(id));
  }

  @PostMapping()
  async create(@RequestBody() dto: CreateUserDto): Promise<User> {
    return this.userService.createUser(dto);
  }

  @PutMapping('/:id')
  async update(
    @PathVariable('id') id: string,
    @RequestBody() dto: UpdateUserDto
  ): Promise<User> {
    return this.userService.updateUser(Number(id), dto);
  }

  @DeleteMapping('/:id')
  async delete(@PathVariable('id') id: string): Promise<{ success: boolean }> {
    const result = await this.userService.deleteUser(Number(id));
    return { success: result };
  }
}
```

### API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/users` | 获取用户列表 |
| GET | `/api/users/:id` | 获取单个用户 |
| POST | `/api/users` | 创建用户 |
| PUT | `/api/users/:id` | 更新用户 |
| DELETE | `/api/users/:id` | 删除用户 |

### 快速开始

```bash
# 1. 进入示例目录
cd examples/user-crud

# 2. 安装依赖（自动生成 route.ts）
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 访问 http://localhost:3000
```

### 依赖说明

```json
{
  "dependencies": {
    "@ai-first/core": "workspace:*",      // 业务层装饰器
    "@ai-first/di": "workspace:*",        // 依赖注入
    "@ai-first/nextjs": "workspace:*",    // Web 层装饰器
    "@ai-first/orm": "workspace:*",       // ORM 框架
    "@ai-first/validation": "workspace:*" // 数据校验
  }
}
```

### 数据流

```
┌──────────────┐     HTTP      ┌──────────────┐
│   Frontend   │ ───────────▶  │  Controller  │
│  (React UI)  │               │ @RestController
└──────────────┘               └──────┬───────┘
                                      │ DI 注入
                                      ▼
                               ┌──────────────┐
                               │   Service    │
                               │  @Service    │
                               └──────┬───────┘
                                      │ DI 注入
                                      ▼
                               ┌──────────────┐
                               │   Mapper     │
                               │  @Mapper     │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │   Entity     │
                               │  @Entity     │
                               └──────────────┘
```

### 扩展指南

#### 添加新的 CRUD 模块

1. **创建 Entity**
   ```bash
   # src/api/entity/product.entity.ts
   ```

2. **创建 DTO**
   ```bash
   # src/api/dto/product.dto.ts
   ```

3. **创建 Mapper**
   ```bash
   # src/api/mapper/product.mapper.ts
   ```

4. **创建 Service**
   ```bash
   # src/api/service/product.service.ts
   ```

5. **创建 Controller**
   ```bash
   # src/api/controller/product.controller.ts
   ```

6. **重新安装依赖**
   ```bash
   pnpm install  # 自动扫描并更新 route.ts
   ```

### 注意事项

1. **命名约定**
   - Controller: `xxx.controller.ts`
   - Service: `xxx.service.ts`
   - Mapper: `xxx.mapper.ts`
   - Entity: `xxx.entity.ts`
   - DTO: `xxx.dto.ts`

2. **自动生成文件**
   - `src/app/api/[...path]/route.ts` 由 postinstall 自动生成
   - 已加入 `.gitignore`，无需手动管理

3. **依赖注入顺序**
   - Mapper → Service → Controller
   - 由框架自动处理

---

## cache-example - 缓存组件示例

一个展示 `@ai-first/cache` 在应用层完整用法的 Node.js TypeScript 示例。

### 功能特性

- ✅ `@RedisComponent` — 标记缓存组件
- ✅ `@Cacheable` — 查询接口缓存
- ✅ `@CachePut` — 更新接口缓存同步
- ✅ `@CacheEvict` — 创建/删除时清除缓存
- ✅ `RedisTemplate` — String / Hash / ZSet 直接操作
- ✅ 无 Redis 时自动降级（不影响业务逻辑）

### 技术栈

```
运行时: Node.js + TypeScript
缓存: @ai-first/cache（ioredis）
Redis: 可选（未配置时自动降级）
```

### 目录结构

```
cache-example/
├── src/
│   ├── entity/
│   │   └── user.entity.ts           # 用户实体
│   ├── service/
│   │   └── user.cache.service.ts    # 用户缓存服务（带缓存装饰器）
│   └── index.ts                     # 主入口 & 演示脚本
├── package.json
├── tsconfig.json
└── README.md
```

### 快速启动

```bash
# 1. 进入示例目录
cd app/examples/cache-example

# 2. 安装依赖
pnpm install

# 3a. 运行（无 Redis，装饰器自动降级）
pnpm start

# 3b. 运行（有 Redis）
REDIS_HOST=127.0.0.1 REDIS_PORT=6379 pnpm start
```

### 对应 Java Spring Boot

| TypeScript（AI-First）| Java（Spring Boot）|
|---|---|
| `@RedisComponent()` | `@Service` |
| `@Cacheable({ key, ttl })` | `@Cacheable(value, key)` |
| `@CachePut({ key, ttl })` | `@CachePut(value, key)` |
| `@CacheEvict({ key })` | `@CacheEvict(value, key)` |
| `@CacheEvict({ allEntries: true })` | `@CacheEvict(allEntries = true)` |
| `RedisTemplate<K, V>` | `RedisTemplate<K, V>` |
