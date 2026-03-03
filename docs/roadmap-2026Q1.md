# AI-First Framework 2026 Q1 目标规划

> 截止日期：2026年3月31日

---

## 一、整体目标

```
┌─────────────────────────────────────────────────────────────────┐
│                      2026 Q1 目标                                │
├─────────────────────────────┬───────────────────────────────────┤
│     AI-First 框架完善        │        Demo 产品 POC              │
│                             │                                   │
│  • 前后端全栈开发能力         │  • Clean Core 核心能力            │
│  • TypeScript → Java 转译    │  • 扩展开发机制                   │
│  • AI 原生识别能力            │  • 配置化支持                     │
└─────────────────────────────┴───────────────────────────────────┘
```

---

## 二、AI-First 框架目标

### 2.1 前后端全栈开发能力

| 目标 | 描述 | 状态 |
|------|------|------|
| Controller 层 | Spring Boot 风格 REST API | ✅ 已完成 |
| Service 层 | 业务逻辑 + 事务管理 | ✅ 已完成 |
| Mapper 层 | ORM 数据访问（BaseMapper） | ✅ 已完成 |
| Entity 层 | 数据库实体映射 | ✅ 已完成 |
| DTO 层 | 数据校验（class-validator） | ✅ 已完成 |
| 依赖注入 | tsyringe + 装饰器 | ✅ 已完成 |
| 自动路由 | postinstall 自动生成 | ✅ 已完成 |
| 前端组件 | React + shadcn/ui | ✅ 已完成 |

### 2.2 TypeScript → Java 代码生成

| 目标 | 描述 | 状态 |
|------|------|------|
| 装饰器对标 | API 层严格对标 Spring Boot | ✅ 已完成 |
| AST 解析 | TypeScript AST 解析器 | ⏳ 进行中 |
| Java 生成器 | Controller/Service/Entity 转译 | ⏳ 进行中 |
| MyBatis 兼容 | Mapper → MyBatis-Plus 转译 | ⏳ 进行中 |
| JPA 兼容 | Entity → JPA 注解转译 | ⏳ 进行中 |

**转译映射示例：**

```
TypeScript                          Java
─────────────────────────────────────────────────────────
@RestController({ path: '/users' }) → @RestController
                                      @RequestMapping("/users")

@GetMapping('/:id')                 → @GetMapping("/{id}")

@PathVariable('id')                 → @PathVariable("id")

@Service()                          → @Service

@Entity({ tableName: 'sys_user' }) → @Entity
                                      @Table(name = "sys_user")

@Mapper(User)                       → @Mapper
extends BaseMapper<User>              extends BaseMapper<User>
```

### 2.3 AI 原生识别能力

| 目标 | 描述 | 状态 |
|------|------|------|
| 装饰器语义 | 装饰器名称与 Spring Boot 一致 | ✅ 已完成 |
| 分层清晰 | Controller → Service → Mapper | ✅ 已完成 |
| 类型安全 | 全程 TypeScript 强类型 | ✅ 已完成 |
| 代码模板 | AI 可直接生成的标准模板 | ✅ 已完成 |
| ESLint 规则 | 规范 AI 生成的代码风格 | ⏳ 进行中 |
| 代码示例库 | 为 AI 提供参考样例 | ⏳ 进行中 |

**AI 友好设计原则：**

1. **命名一致性** - 装饰器/类名与 Spring Boot 完全一致
2. **模式固定** - Entity → DTO → Mapper → Service → Controller
3. **约定优于配置** - 文件命名约定自动注册
4. **类型推导** - 强类型让 AI 减少错误

---

## 三、Demo 产品 POC 目标

### 3.1 Clean Core 核心能力

```
┌─────────────────────────────────────────────────────────────────┐
│                       Clean Core 架构                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Extension Layer                        │   │
│  │              （客户扩展 / 二次开发）                        │   │
│  │         • 自定义 Controller / Service                     │   │
│  │         • 自定义业务逻辑                                   │   │
│  │         • 配置化覆盖                                       │   │
│  └──────────────────────────────────────────────────────────┘   │
│                             ▲                                    │
│                             │ 继承/扩展                          │
│                             │                                    │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     Core Layer                            │   │
│  │                （产品核心 / 不可修改）                       │   │
│  │         • 标准 Entity / DTO                               │   │
│  │         • 标准 Service 接口                               │   │
│  │         • 标准 API 接口                                   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| 目标 | 描述 | 状态 |
|------|------|------|
| Core 包 | 核心业务逻辑封装（不可修改） | 🔲 待开始 |
| Extension 机制 | 扩展点定义与注册 | 🔲 待开始 |
| 版本隔离 | Core 升级不影响 Extension | 🔲 待开始 |
| 接口稳定 | Core API 向后兼容 | 🔲 待开始 |

### 3.2 扩展开发机制

| 目标 | 描述 | 状态 |
|------|------|------|
| Service 扩展 | 继承 Core Service 添加逻辑 | 🔲 待开始 |
| Controller 扩展 | 新增 API 端点 | 🔲 待开始 |
| Entity 扩展 | 扩展字段（不修改表结构） | 🔲 待开始 |
| 事件钩子 | Before/After 业务钩子 | 🔲 待开始 |
| 插件系统 | 插件加载与管理 | 🔲 待开始 |

**扩展示例：**

```typescript
// Core 层（产品提供，不可修改）
@Service()
export class CoreUserService {
  async createUser(dto: CreateUserDto): Promise<User> {
    // 核心创建逻辑
  }
}

// Extension 层（客户扩展）
@Service()
export class ExtUserService extends CoreUserService {
  async createUser(dto: CreateUserDto): Promise<User> {
    // 前置扩展逻辑
    await this.beforeCreate(dto);
    
    // 调用核心逻辑
    const user = await super.createUser(dto);
    
    // 后置扩展逻辑
    await this.afterCreate(user);
    
    return user;
  }
}
```

### 3.3 配置化支持

| 目标 | 描述 | 状态 |
|------|------|------|
| 字段配置 | 字段显示/隐藏/只读 | 🔲 待开始 |
| 校验配置 | 动态校验规则 | 🔲 待开始 |
| 流程配置 | 业务流程配置化 | 🔲 待开始 |
| 权限配置 | 基于角色的访问控制 | 🔲 待开始 |
| UI 配置 | 表单/列表布局配置 | 🔲 待开始 |

**配置示例：**

```yaml
# user.config.yaml
entity: User
fields:
  username:
    label: 用户名
    required: true
    readonly: false
  email:
    label: 邮箱
    required: true
    validation:
      - type: email
        message: 邮箱格式不正确
  age:
    label: 年龄
    required: false
    visible: true

list:
  columns: [username, email, age, createdAt]
  sortable: [username, createdAt]
  searchable: [username, email]

form:
  layout: vertical
  sections:
    - title: 基本信息
      fields: [username, email]
    - title: 其他信息
      fields: [age]
```

---

## 四、里程碑计划

```
2026年3月
───────────────────────────────────────────────────────────────────
Week 1 (3/2-3/8)
├── [框架] 完善 ORM 适配器（MySQL/PostgreSQL）
├── [框架] ESLint 规则完善
└── [文档] AI 代码生成指南

Week 2 (3/9-3/15)
├── [框架] TypeScript AST 解析器
├── [框架] Java Controller 生成器
└── [产品] Clean Core 架构设计

Week 3 (3/16-3/22)
├── [框架] Java Service/Entity 生成器
├── [框架] MyBatis-Plus 转译
└── [产品] Extension 机制实现

Week 4 (3/23-3/31)
├── [框架] 端到端测试
├── [产品] 配置化支持
├── [产品] Demo POC 演示
└── [文档] 完整文档发布
```

---

## 五、交付物清单

### 5.1 AI-First 框架

| 交付物 | 描述 |
|--------|------|
| @ai-first/core | 业务层装饰器 |
| @ai-first/di | 依赖注入容器 |
| @ai-first/orm | ORM 框架 |
| @ai-first/validation | 数据校验 |
| @ai-first/nextjs | Web 层装饰器 |
| @ai-first/codegen | Java 代码生成器 |
| @ai-first/eslint-plugin | ESLint 规则 |
| 完整文档 | 架构 + 示例 + API |

### 5.2 Demo 产品 POC

| 交付物 | 描述 |
|--------|------|
| Clean Core 包 | 核心业务封装 |
| Extension SDK | 扩展开发 SDK |
| 配置中心 | 配置管理界面 |
| Demo 应用 | 完整演示应用 |

---

## 六、成功标准

| 指标 | 目标 |
|------|------|
| 框架完整度 | 支持完整 CRUD 开发流程 |
| Java 转译率 | Controller/Service/Entity 100% 可转译 |
| AI 识别率 | AI 可直接生成符合规范的代码 |
| Clean Core | 核心与扩展完全隔离 |
| 配置化覆盖 | 80% 常见需求可通过配置实现 |
| Demo 完成度 | 可演示完整业务流程 |

---

## 七、风险与应对

| 风险 | 影响 | 应对措施 |
|------|------|----------|
| TypeScript → Java 转译复杂度 | 高 | 优先实现 80% 常用场景 |
| Clean Core 架构设计难度 | 中 | 参考 SAP Clean Core 最佳实践 |
| 配置化灵活性与复杂度平衡 | 中 | 渐进式实现，先满足核心场景 |
| 时间紧张 | 高 | 聚焦 MVP，非核心功能延后 |
