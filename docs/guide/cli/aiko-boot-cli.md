# `aiko-boot` CLI 指南

`@ai-partner-x/aiko-boot-cli` 用于创建和扩展 Aiko Boot 脚手架工程。

## 安装与运行

```bash
# 推荐：临时执行
pnpm dlx @ai-partner-x/aiko-boot-cli@latest --help

# 或 npx
npx @ai-partner-x/aiko-boot-cli@latest --help

# 安装到项目后使用
pnpm add -D @ai-partner-x/aiko-boot-cli
pnpm aiko-boot --help
```

CLI 名称为 `aiko-boot`。

---

## 命令总览

- `create`：创建新的脚手架工程
- `add-app`：新增前端应用（`admin` / `mobile`）
- `add-api`：新增后端服务（支持 `plain` / `system` 预设）
- `add-feature`：给已有 API 增加组件（`mq` / `file` / `redis` / `log`）
- `list`：查看当前脚手架配置
- `env list|add|remove`：管理 `.env.<mode>` 与对应脚本

> 增量命令依赖根目录 `.aiko-boot.json`。  
> 默认在当前目录执行，可用 `--root` 指定目标脚手架根目录。

---

## 1) create

```bash
aiko-boot create [targetDir] [options]
```

### 选项

- `-n, --name <name>` 项目名/包 scope（如 `my-app`）
- `--with-admin-suite` 创建 admin + mobile + system(api) 套件
- `--db <db>` 仅在 `--with-admin-suite` 时生效：`sqlite | postgres | mysql`
- `--features <items>` 仅在 `--with-admin-suite` 时生效：逗号分隔 `mq,file,redis,log`
- `--empty` 仅创建空 monorepo（不创建任何 app/api）
- `--dry-run` 仅打印动作，不落盘

### 示例

```bash
# 一次创建后台套件（admin + mobile + system api）
aiko-boot create my-app --with-admin-suite --db sqlite --features mq,redis

# 先创建空工程
aiko-boot create my-app --empty
```

---

## 2) add-app

```bash
aiko-boot add-app [name] [options]
```

### 选项

- `-t, --type <type>`：`admin | mobile`
- `--root <dir>`：脚手架根目录
- `--dry-run`

### 示例

```bash
aiko-boot add-app admin --type admin
aiko-boot add-app mobile --type mobile
```

---

## 3) add-api

```bash
aiko-boot add-api [name] [options]
```

### 选项

- `--preset <preset>`：`plain | system`
  - `plain` -> 使用干净 API 模板（`api-clean`）
  - `system` -> 使用带认证/用户管理模板（`api-system`）
- `--db <db>`：`sqlite | postgres | mysql`
- `--features <items>`：逗号分隔，支持 `mq,file,redis,log`
- `--yes`：非交互模式，缺省项走默认值
- `--interactive`：强制交互
- `--root <dir>`
- `--dry-run`

### 交互行为

未传参数时，默认会交互式询问：

1. 选择 API 预设（plain/system）
2. 选择数据库
3. 多选组件（mq/file/redis/log）

### 示例

```bash
# 全交互
aiko-boot add-api api-v2

# 非交互
aiko-boot add-api api-v2 --preset plain --db sqlite --features mq,redis --yes
```

---

## 4) add-feature

```bash
aiko-boot add-feature --service <service> --feature <feature> [options]
```

### 选项

- `--service <service>`：目标 API 名称（必填）
- `--feature <feature>`：`redis | file | mq | log`（必填）
- `--root <dir>`
- `--dry-run`

### 示例

```bash
aiko-boot add-feature --service api --feature mq
aiko-boot add-feature --service api --feature file
```

---

## 5) list

```bash
aiko-boot list [options]
```

### 选项

- `--root <dir>`

输出当前 `apps/apis/features` 清单。

---

## 6) env 命令

```bash
aiko-boot env list [options]
aiko-boot env add <mode> [options]
aiko-boot env remove <mode> [options]
```

### `env list`

- `--root <dir>`

列出现有环境（如 `dev/stage/prod/qa`）以及各 app/api 是否已生成 `.env.<mode>`。

### `env add <mode>`

- `--root <dir>`
- `--force` 覆盖已有 `.env.<mode>`
- `--dry-run`

会基于每个包的 `.env.example` 生成 `.env.<mode>`，并注入对应脚本：

- 根：`dev:<mode>`（`mode=dev` 时通常使用根 `dev`）
- API：`dev:<mode>` / `start:<mode>`
- 前端：`dev:<mode>` / `build:<mode>`

### `env remove <mode>`

- `--root <dir>`
- `--force`
- `--dry-run`

删除 `.env.<mode>` 并清理相关脚本。

---

## 常见流程

```bash
# 1. 创建工程（后台套件）
aiko-boot create demo --with-admin-suite --db sqlite --features mq
cd demo
pnpm install

# 2. 增加一个 plain API（带 mq）
aiko-boot add-api api-order --preset plain --db sqlite --features mq --yes

# 3. 启动
pnpm dev
```

---

## 备注

- 模板内通常只保留 `.env.example`，`.env.<mode>` 由 `env add` 统一生成。
- 若端口冲突（如 `3001` 已占用），请先释放端口或调整 `PORT`。
