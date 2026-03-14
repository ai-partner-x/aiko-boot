/**
 * Storage-Upload API Server — aiko-boot 文件上传示例
 *
 * 演示 @ai-partner-x/aiko-boot-starter-storage 与 REST API 的集成：
 * - createApp 自动加载 app.config.ts、扫描 controller/ 并注册到 DI 容器
 * - 本地存储（local provider）：文件保存到 ./uploads 目录
 * - multer 中间件处理 multipart/form-data 文件上传
 *
 * 启动服务：
 *   pnpm dev
 *
 * 接口列表：
 *   POST   http://localhost:3003/api/upload          上传单文件（form-data: file, folder?）
 *   POST   http://localhost:3003/api/upload/multiple 上传多文件（form-data: files[], folder?）
 *   DELETE http://localhost:3003/api/upload?key=...  删除文件
 *   GET    http://localhost:3003/api/upload/url?key=...      获取文件 URL
 *   GET    http://localhost:3003/api/upload/preview?key=...  获取图片预览 URL
 *
 * 上传示例（curl）：
 *   curl -X POST http://localhost:3003/api/upload \
 *     -F "file=@/path/to/image.png" \
 *     -F "folder=images"
 */
import 'reflect-metadata';
import { createApp } from '@ai-partner-x/aiko-boot';
import { getExpressApp } from '@ai-partner-x/aiko-boot-starter-web';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import express from 'express';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = await createApp({ srcDir: __dirname });

// 配置 multer 文件上传中间件（使用内存缓冲，由 StorageService 负责持久化）
const expressApp = getExpressApp();
if (expressApp) {
  const upload = multer({ storage: multer.memoryStorage() });
  expressApp.post('/api/upload', upload.single('file'));
  expressApp.post('/api/upload/multiple', upload.array('files', 10));

  // 配置静态文件服务（本地存储时可直接访问上传的文件）
  const uploadsDir = join(__dirname, '..', 'uploads');
  expressApp.use('/api/uploads', express.static(uploadsDir));
}

await app.run();
const port = app.config.get<number>('server.port', 3003);
console.log(`\n📁 Storage Upload Example`);
console.log(`📡 API: http://localhost:${port}/api`);
console.log(`📤 Upload: POST http://localhost:${port}/api/upload\n`);
