# AI-First Framework — App 说明

> 本文档描述 `app/` 目录下所有应用和框架组件的功能、结构与使用方式。

---

## 目录结构总览

```
app/
├── examples/              # 示例应用
│   ├── admin/             # 采购管理后台示例（Vite + React）
│   └── user-crud/         # 用户 CRUD 示例（Next.js，Monorepo）
└── framework/             # 框架级共享组件库
    ├── admin-component/   # 管理端组件库 (@aff/admin-component)
    ├── api-component/     # API 层共享组件 (@aff/api-component)
    └── mall-component/    # 商城端组件库 (@aff/mall-component)
```

---

## framework/ — 框架共享组件库

### @aff/admin-component

**路径：** `app/framework/admin-component/`  
**包名：** `@aff/admin-component`  
**版本：** 0.1.0  
**描述：** 管理端共享 UI 组件库，基于 shadcn/ui + Tailwind CSS + TanStack Table。

#### 技术栈

- React 18/19
- TanStack React Table v8（数据表格）
- Radix UI（无障碍原语）
- Tailwind CSS + tailwind-merge
- react-hook-form
- lucide-react（图标）
- sonner（Toast 通知）

#### 导出组件

##### 基础 UI 组件

| 组件 | 说明 |
|------|------|
| `Button` | 按钮，支持 `variant`、`size` 变体 |
| `Card`, `CardHeader`, `CardContent`, ... | 卡片容器组件 |
| `Dialog`, `DialogContent`, `DialogHeader`, ... | 模态对话框 |
| `Form`, `FormItem`, `FormLabel`, `FormField`, ... | 表单容器（配合 react-hook-form） |
| `Input` | 输入框 |
| `Select`, `SelectItem` | 下拉选择 |
| `Label` | 表单标签 |
| `Table`, `TableHeader`, `TableBody`, ... | 基础表格 |
| `Toaster` | Toast 通知容器（基于 sonner） |

##### 框架专属组件

###### DataTable\<T\>

通用数据表格，支持排序、分页、行选择。

```typescript
import { DataTable, type DataTableColumn } from '@aff/admin-component';

const columns: DataTableColumn<User>[] = [
  { id: 'id', header: 'ID', accessorKey: 'id' },
  { id: 'name', header: '姓名', accessorKey: 'name' },
  {
    id: 'actions',
    header: '操作',
    cell: ({ row }) => <Button onClick={() => handleEdit(row.original)}>编辑</Button>,
  },
];

<DataTable
  data={users}
  columns={columns}
  loading={isLoading}
  enableRowSelection
  pageSize={25}
  totalCount={total}
  onPaginationChange={(page, pageSize) => fetchData(page, pageSize)}
  onRowClick={(row) => navigate(`/users/${row.id}`)}
/>
```

| Prop | 类型 | 说明 |
|------|------|------|
| `data` | `T[]` | 数据列表 |
| `columns` | `DataTableColumn<T>[]` | 列定义 |
| `loading` | `boolean` | 加载状态 |
| `enableRowSelection` | `boolean` | 开启行选择 |
| `selectedRows` | `T[]` | 受控选中行 |
| `onSelectionChange` | `(rows: T[]) => void` | 选择变化回调 |
| `pageSize` | `number` | 每页条数（默认 25） |
| `pageIndex` | `number` | 当前页（0-based） |
| `totalCount` | `number` | 总记录数（服务端分页） |
| `onPaginationChange` | `(page, pageSize) => void` | 分页变化回调 |
| `onSortChange` | `(field, direction) => void` | 排序变化回调 |
| `onRowClick` | `(row: T) => void` | 行点击事件 |
| `onRowDoubleClick` | `(row: T) => void` | 行双击事件 |

###### StatusChip / MappedStatusChip

状态标签组件，支持自定义颜色映射。

```typescript
import { StatusChip, MappedStatusChip, approvalStatusMap } from '@aff/admin-component';

// 基础用法
<StatusChip label="已批准" color="green" />

// 使用内置状态映射
<MappedStatusChip value="APPROVED" statusMap={approvalStatusMap} />
```

内置状态映射：
- `approvalStatusMap`：审批状态（DRAFT / PENDING / APPROVED / REJECTED）
- `prStatusMap`：采购申请状态

###### SearchFilterBar

搜索与过滤栏组件，支持多字段过滤。

```typescript
import { SearchFilterBar, type FilterField } from '@aff/admin-component';

const filterFields: FilterField[] = [
  { key: 'keyword', label: '关键字', type: 'text' },
  { key: 'status', label: '状态', type: 'select', options: [...] },
  { key: 'dateRange', label: '日期范围', type: 'dateRange' },
];

<SearchFilterBar
  fields={filterFields}
  onSearch={(values) => fetchData(values)}
  onReset={() => fetchData({})}
/>
```

#### 工具函数

```typescript
import { cn } from '@aff/admin-component';

// 合并 Tailwind 类名（基于 clsx + tailwind-merge）
const className = cn('px-4 py-2', isActive && 'bg-blue-500', customClass);
```

---

### @aff/api-component

**路径：** `app/framework/api-component/`  
**包名：** `@aff/api-component`  
**版本：** 0.1.0  
**描述：** API 层共享工具包（规划扩展中）。

---

### @aff/mall-component

**路径：** `app/framework/mall-component/`  
**包名：** `@aff/mall-component`  
**版本：** 0.1.0  
**描述：** 商城端（移动/H5）共享 UI 组件库，轻量级，适合移动端场景。

#### 技术栈

- React 18/19
- Tailwind CSS + tailwind-merge
- class-variance-authority（组件变体）
- lucide-react（图标）

---

## examples/ — 示例应用

### admin — 采购管理后台示例

**路径：** `app/examples/admin/`  
**包名：** `@app/admin`  
**描述：** 模拟 SAP 采购管理系统的完整管理后台，展示 `@aff/admin-component` 的实际用法。

#### 技术栈

```
前端框架: React 19 + Vite 6
路由: react-router-dom v7
UI 组件: @aff/admin-component（框架共享组件）
图标: lucide-react
样式: Tailwind CSS v3
```

#### 快速启动

```bash
cd app/examples/admin
pnpm install
pnpm dev    # 启动开发服务器（默认 http://localhost:5173）
pnpm build  # 构建生产包
```

#### 布局系统

支持两种布局模式，用户可在应用内切换，偏好保存至 `localStorage`：

| 模式 | 组件 | 说明 |
|------|------|------|
| `menu` | `MenuLayout` | 左侧导航菜单布局 |
| `tile` | `TileLayout` | 磁贴式首页布局 |

#### 路由结构

```
/                              首页
/purchase-requisitions         采购申请列表
/purchase-requisitions/create  新建采购申请
/purchase-requisitions/:id     查看采购申请
/purchase-requisitions/:id/edit 编辑采购申请
/purchase-orders               采购订单列表
/purchase-orders/:id           查看采购订单
/goods-receipt                 收货管理列表
/goods-receipt/create          新建收货
/goods-receipt/:id             查看收货单
/goods-receipt/:id/edit        编辑收货单
/master-data/materials         物料主数据列表
/master-data/materials/:id     物料详情
/master-data/vendors           供应商列表
/master-data/vendors/:id       供应商详情
/master-data/plants            工厂/仓库列表
/master-data/plants/:id        工厂详情
/master-data/currencies        币种配置
/master-data/units-of-measure  计量单位配置
/master-data/purchase-organizations  采购组织
/master-data/cost-centers      成本中心
/reports/purchase-requisitions 采购申请报表
/reports/purchase-orders       采购订单报表
/settings                      系统设置
```

#### 模块说明

##### 采购申请（purchase-requisitions）

| 文件 | 说明 |
|------|------|
| `ListPage.tsx` | 采购申请列表，支持搜索、过滤、分页 |
| `CreatePage.tsx` | 新建采购申请表单 |
| `ViewPage.tsx` | 采购申请详情（只读） |
| `EditPage.tsx` | 编辑采购申请 |

##### 采购订单（purchase-orders）

| 文件 | 说明 |
|------|------|
| `ListPage.tsx` | 采购订单列表 |
| `ViewPage.tsx` | 采购订单详情 |

##### 收货管理（goods-receipt）

| 文件 | 说明 |
|------|------|
| `ListPage.tsx` | 收货记录列表 |
| `CreatePage.tsx` | 新建收货单 |
| `ViewPage.tsx` | 收货单详情 |
| `EditPage.tsx` | 编辑收货单 |

##### 主数据（master-data）

| 模块 | 说明 |
|------|------|
| `materials/` | 物料主数据（列表 + 详情） |
| `vendors/` | 供应商主数据（列表 + 详情） |
| `plants/` | 工厂/仓库（列表 + 详情） |
| `currencies/` | 币种配置 |
| `units-of-measure/` | 计量单位配置 |
| `purchase-organizations/` | 采购组织 |
| `cost-centers/` | 成本中心 |

##### 报表（reports）

| 文件 | 说明 |
|------|------|
| `PurchaseRequisitionReport.tsx` | 采购申请统计报表 |
| `PurchaseOrderReport.tsx` | 采购订单统计报表 |

#### 组件结构

```
src/
├── App.tsx                    # 应用入口 + 路由配置
├── main.tsx                   # React 渲染入口
├── layouts/
│   ├── MenuLayout.tsx         # 左侧导航布局
│   └── TileLayout.tsx         # 磁贴首页布局
├── pages/
│   ├── HomePage.tsx           # 首页（磁贴导航）
│   ├── SettingsPage.tsx       # 设置页
│   ├── purchase-requisitions/ # 采购申请模块
│   ├── purchase-orders/       # 采购订单模块
│   ├── goods-receipt/         # 收货管理模块
│   ├── master-data/           # 主数据模块
│   └── reports/               # 报表模块
└── components/
    ├── ShellBar.tsx            # 顶部导航栏
    ├── EditableTable/          # 可编辑表格
    ├── ListReport/             # 列表报表
    ├── MasterDetail/           # 主从视图
    └── ObjectPage/             # 对象页面
```

---

### user-crud — 用户管理 CRUD 示例

**路径：** `app/examples/user-crud/`  
**描述：** 用户增删改查全栈示例，使用 Next.js + AI-First Framework 全栈分层架构，内部为 Monorepo 结构。

#### 技术栈

```
Next.js API Routes + Controller + Service + Mapper
React 19 + shadcn/ui + Tailwind CSS
class-validator + react-hook-form + zod
@ai-first/core, @ai-first/di, @ai-first/orm, @ai-first/nextjs, @ai-first/validation
```

#### 内部 Monorepo 结构

```
user-crud/
├── packages/
│   ├── api/           # @user-crud/api   后端 API（Express / Next.js）
│   ├── admin/         # 管理后台前端
│   └── mall-mobile/   # 移动端（商城）
├── pnpm-workspace.yaml
└── package.json
```

#### packages/api（@user-crud/api）

后端 API 服务，使用 `@ai-first/api-starter` + PostgreSQL。

```bash
cd app/examples/user-crud
pnpm dev:api     # 启动 API 服务（tsx watch）
pnpm dev:admin   # 启动管理后台
pnpm dev         # 并行启动所有服务
```

API 标准目录约定：

```
src/
├── api/
│   ├── controller/      # @RestController
│   ├── service/         # @Service
│   ├── mapper/          # @Mapper extends BaseMapper
│   ├── entity/          # @Entity
│   └── dto/             # class-validator 装饰器
└── app/
    └── api/[...path]/
        └── route.ts     # ⚡ postinstall 自动生成
```

#### 快速启动

```bash
# 1. 进入示例目录
cd app/examples/user-crud

# 2. 安装依赖（自动生成 route.ts）
pnpm install

# 3. 启动开发服务器
pnpm dev

# 4. 访问 http://localhost:3000
```

---

## app/ 整体依赖关系

```
框架组件层
┌─────────────────────────────────────────────────┐
│  @aff/admin-component   @aff/mall-component      │
│  @aff/api-component                              │
└────────────────┬────────────────────────────────┘
                 │ 引用
示例应用层         ▼
┌─────────────────────────────────────────────────┐
│  app/examples/admin         @app/admin           │
│  app/examples/user-crud     @user-crud/*         │
└─────────────────────────────────────────────────┘
                 │ 引用
框架核心层（packages/）
┌─────────────────────────────────────────────────┐
│  @ai-first/di  @ai-first/core  @ai-first/orm     │
│  @ai-first/validation  @ai-first/nextjs          │
└─────────────────────────────────────────────────┘
```

---

## 开发规范

### 新建管理页面

以采购申请为参考，每个业务模块包含以下文件：

```
pages/<module>/
├── index.ts       # 统一导出（re-export）
├── ListPage.tsx   # 列表页
├── ViewPage.tsx   # 详情页（只读）
├── CreatePage.tsx # 新建页（如有）
└── EditPage.tsx   # 编辑页（如有）
```

### 新建框架组件

在 `app/framework/admin-component/src/ui/` 下创建组件文件，并在 `src/index.ts` 中导出：

```typescript
// src/index.ts
export { MyNewComponent, type MyNewComponentProps } from './ui/my-new-component';
```
