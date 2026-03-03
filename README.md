# AI-First Framework

**AI 可理解的全栈开发框架**

基于 React + Next.js + TypeScript，通过 ESLint 规范化，让 AI 能够理解、生成、优化您的全栈应用代码。

## 🎯 核心理念

- **AI Native**: 使用 AI 最熟悉的语言 (React/Next.js)
- **Code First**: 代码即设计，无需学习新 DSL
- **Type Safe**: TypeScript + ESLint 保证代码质量
- **Java Compatible**: 前端代码可转换为 Java 后端

## 📦 工程结构

```
ai-first-framework/
├── packages/
│   ├── core/            # 核心装饰器和元数据系统 ✅ 已完成
│   ├── nextjs/          # Next.js 适配层 (待开发)
│   ├── di/              # 依赖注入容器 (待开发)
│   ├── types/           # 类型定义和 DTO 基类 (待开发)
│   ├── validation/      # 数据验证 (待开发)
│   ├── eslint-plugin/   # ESLint 规范插件 (待开发)
│   └── codegen/         # Java 代码生成器 (待开发)
├── examples/            # 示例项目
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

## 🚀 快速开始

### 安装依赖

```bash
pnpm install
```

### 构建所有包

```bash
pnpm build
```

### 开发模式（热更新）

```bash
pnpm dev
```

### 代码检查

```bash
pnpm lint
```

### 类型检查

```bash
pnpm type-check
```

## 📚 已完成的包

### @ai-first/core

核心装饰器和元数据系统，提供：

- **实体层装饰器**: `@Entity`, `@Field`, `@DbField`, `@Validation`
- **服务层装饰器**: `@Repository`, `@Service`, `@AppService`
- **方法装饰器**: `@Action`, `@Expose`, `@Transactional`

查看 [packages/core/README.md](./packages/core/README.md) 了解详细用法。

## 🎓 示例代码

```typescript
import { Entity, Field, DbField, Validation, Service, AppService, Action, Expose } from '@ai-first/core';

// 定义实体
@Entity({ table: 'users' })
export class User {
  @Field({ label: 'ID' })
  @DbField({ primaryKey: true, type: 'BIGINT' })
  id: number;

  @Field({ label: 'Username' })
  @Validation({ required: true, min: 3, max: 50 })
  username: string;
}

// 定义服务
@Service()
export class UserService {
  async findById(id: number): Promise<User | null> {
    // 实现逻辑
  }
}

// 定义应用服务（可暴露为 API）
@AppService({ expose: true })
export class UserAppService {
  constructor(private userService: UserService) {}

  @Action({ transaction: true })
  @Expose({ method: 'POST', path: '/api/user/create' })
  async createUser(data: CreateUserDto): Promise<User> {
    return this.userService.create(data);
  }
}
```

## 🛣️ 开发路线图

- [x] 项目初始化和 monorepo 结构
- [x] @ai-first/core - 核心装饰器系统
- [ ] @ai-first/di - 依赖注入容器
- [ ] @ai-first/types - 类型定义和 DTO 基类
- [ ] @ai-first/validation - 数据验证器
- [ ] @ai-first/nextjs - Next.js 适配层
- [ ] @ai-first/eslint-plugin - ESLint 规范插件
- [ ] @ai-first/codegen - Java 代码生成器
- [ ] 示例项目
- [ ] 完整文档

## 📖 文档

- [核心概念](./docs/concepts.md) (待编写)
- [快速开始](./docs/quick-start.md) (待编写)
- [API 参考](./docs/api-reference.md) (待编写)

## 🤝 贡献

欢迎贡献代码、报告问题或提出建议！

## 📄 License

MIT

---

**Build with AI, Run Anywhere** 🚀
