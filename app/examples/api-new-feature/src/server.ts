/**
 * New-Features Example — API Server
 *
 * 演示当前分支所有新增装饰器：
 *   1. @Async          — fire-and-forget 后台任务 (@ai-first/core)
 *   2. @RequestPart    — multipart 文件上传 (@ai-first/nextjs)
 *   3. MultipartFile   — Spring Boot 兼容文件接口 (@ai-first/nextjs)
 *   4. @ModelAttribute — query + form body 绑定 (@ai-first/nextjs)
 *   5. @RequestAttribute — Express req 自定义属性注入 (@ai-first/nextjs)
 *
 * 架构说明：
 *   为了演示 @RequestAttribute，需要 Express 中间件在路由前设置 req 属性。
 *   这里使用"外层 Express 应用"包裹 createApp 返回值：
 *
 *     outerApp
 *       ├── urlencoded middleware       (form body 解析，供 @ModelAttribute 使用)
 *       ├── Auth middleware             (模拟：设置 req.currentUser + req.tenantId)
 *       └── innerApp (createApp)        (注册所有 Controller 路由)
 */
import 'reflect-metadata';
import express, { type Request, type Response, type NextFunction } from 'express';
import corsMiddleware from 'cors';
import { createApp } from '@ai-first/nextjs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3003;

// ─── 创建 inner app（扫描并注册所有 Controller） ────────────────────────────
const innerApp = await createApp({
  srcDir: __dirname,
  cors: false,   // 由外层统一处理 CORS
  verbose: true,
});

// ─── 创建 outer app，在路由执行前注入 req 属性 ──────────────────────────────
const app = express();

// CORS（统一在外层处理）
app.use(corsMiddleware());

// urlencoded body 解析（供 @ModelAttribute form 演示使用）
app.use(express.urlencoded({ extended: true }));

// JSON body 解析
app.use(express.json());

/**
 * 模拟 Auth 中间件：在路由前设置 req.currentUser 和 req.tenantId。
 * 真实项目中这里会验证 JWT token 并从数据库加载用户信息。
 *
 * 这正是 @RequestAttribute 的典型使用场景 —— 控制器通过注解
 * 直接声明对这些属性的依赖，无需手动读取 req 对象。
 */
app.use((_req: Request, _res: Response, next: NextFunction) => {
  const req = _req as Request & { currentUser?: object; tenantId?: string };
  req.currentUser = { id: 1, name: 'Alice', role: 'admin' };
  req.tenantId = 'tenant-42';
  next();
});

// 将 inner app（含所有 Controller 路由）挂载到 outer app
// Express 共享同一个 req 对象，因此上面注入的属性在 inner app 中同样可见
app.use(innerApp);

app.listen(PORT, () => {
  console.log(`
🚀 New-Features Example running at http://localhost:${PORT}

──────────────────────────────────────────────────────────
Feature 1 — @Async (fire-and-forget 后台任务)
  POST   /api/async/send-email
  POST   /api/async/send-password-reset
  POST   /api/async/generate-report
  POST   /api/async/trigger-error
  GET    /api/async/log
  DELETE /api/async/log

Feature 2 & 3 — @RequestPart + MultipartFile (文件上传)
  POST   /api/upload/single     -F "file=@photo.png"
  POST   /api/upload/avatar     -F "avatar=@avatar.jpg"
  POST   /api/upload/multi      -F "document=@doc.pdf" -F "thumbnail=@thumb.png"

Feature 4 — @ModelAttribute (query / form 绑定)
  GET    /api/form/search?keyword=alice&page=1
  POST   /api/form/register    -d "username=alice&email=alice@example.com"

Feature 5 — @RequestAttribute (读取中间件设置的 req 属性)
  GET    /api/form/profile
  GET    /api/form/tenant-info
──────────────────────────────────────────────────────────
`);
});
