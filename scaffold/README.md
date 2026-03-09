# Scaffold Monorepo

多项目 monorepo 脚手架，包含 **api**、**admin**、**mobile**、**shared**。

## 目录结构

```
scaffold/
├── packages/
│   ├── api       # 后端 API（aiko-boot，当前实现用户登录）
│   ├── shared    # admin / mobile 公共模块（类型、常量、工具）
│   ├── admin     # 管理端（留空，Vite + React 壳子）
│   └── mobile    # 移动端 H5（Next.js）
└── package.json
```

## 只运行这一个项目

可以。scaffold 依赖仓库内的 `@ai-partner-x/*` 等包，因此需要在 **ai-frist-framework 仓库内** 使用，但日常只需操作 scaffold 本身：

1. 在仓库根 **执行一次** `pnpm install`（或进入 scaffold 后执行 `pnpm install`）。
2. 之后所有开发、构建、启动都在 **scaffold 目录** 下完成，无需运行或构建仓库里其他项目（如 user-crud、其他 examples）。

```bash
cd scaffold
pnpm init-db    # 首次
pnpm dev        # 并行启动 api + admin + mobile
```

**测试登录**：mobile 的登录页会请求 `http://localhost:3001/api/auth/login`，需先保证 API 已启动（`pnpm dev:api` 或 `pnpm dev` 已包含）。

## 前置

- Node 18+
- pnpm

**安装依赖**（在仓库根或 scaffold 目录下执行均可，会使用仓库根 workspace）：

```bash
cd /path/to/ai-frist-framework
pnpm install
# 或在 scaffold 目录下
cd scaffold && pnpm install
```

`init-db` 使用纯 JS 的 sql.js，无需编译。**运行 API 服务**（`pnpm dev:api`）时依赖 better-sqlite3 原生模块；若报错找不到 bindings，在**仓库根**执行（会进入 better-sqlite3 目录执行 `node-gyp rebuild`）：

```bash
pnpm run rebuild:sqlite
```

## 开发

依赖在仓库根安装完成后，在 **scaffold 目录** 下执行：

```bash
cd scaffold
pnpm init-db    # 首次运行：初始化 SQLite 数据库
pnpm dev        # 并行启动 api + admin + mobile
```

或分别启动：

- `pnpm dev:api`    — API 默认 http://localhost:3001
- `pnpm dev:admin`  — Admin 管理端（留空）
- `pnpm dev:mobile` — Mobile 默认 http://localhost:3002

## 构建

```bash
pnpm build
# 或
pnpm build:api
pnpm build:admin
pnpm build:mobile
```

## API 说明

- **POST /api/auth/login**  
  请求体：`{ "username": "admin", "password": "admin123" }`  
  成功返回：`{ "success": true, "data": { "id", "username", "email" } }`

默认测试账号（见 `packages/api` 的 init-db）：`admin` / `admin123`。
