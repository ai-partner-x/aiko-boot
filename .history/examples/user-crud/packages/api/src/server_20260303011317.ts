/**
 * API Server - 纯后端服务（无前端）
 * 使用 Express + AI-First Controller 装饰器
 */
import 'reflect-metadata';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import {
  getControllerMetadata,
  getRequestMappings,
  getPathVariables,
  getRequestBody,
} from '@ai-first/nextjs';

// 导入依赖层并手动实例化
import { UserMapper } from './mapper/user.mapper.js';
import { UserService } from './service/user.service.js';
import { UserController } from './controller/user.controller.js';

// 手动创建依赖链
const userMapper = new UserMapper();
const userService = new UserService(userMapper);
const userController = new UserController(userService);

const app = express();
app.use(cors());
app.use(express.json());

interface ControllerInstance {
  [key: string]: (...args: any[]) => Promise<any>;
}

function registerController(ControllerClass: new (...args: any[]) => any, instance: ControllerInstance) {
  const controllerMeta = getControllerMetadata(ControllerClass);
  if (!controllerMeta) {
    console.warn('[API] No @RestController metadata for ' + ControllerClass.name);
    return;
  }

  const basePath = controllerMeta.path || '';
  const mappings = getRequestMappings(ControllerClass);

  for (const [methodName, mapping] of Object.entries(mappings)) {
    const method = (mapping.method || 'GET').toLowerCase();
    const fullPath = '/api' + basePath + (mapping.path || '');
    console.log('[API] ' + method.toUpperCase() + ' ' + fullPath);

    const handler = async (req: Request, res: Response, _next: NextFunction) => {
      const start = Date.now();
      const reqLog = `[${method.toUpperCase()}] ${fullPath}`;
      console.log(`\n→ ${reqLog}`);
      if (Object.keys(req.params).length) console.log('  params :', req.params);
      if (Object.keys(req.query).length)  console.log('  query  :', req.query);
      if (req.body && Object.keys(req.body).length) console.log('  body   :', req.body);

      try {
        const controllerMethod = instance[methodName];
        const pathVariables = getPathVariables(ControllerClass.prototype, methodName);
        const requestBody = getRequestBody(ControllerClass.prototype, methodName);

        const paramCount = controllerMethod.length;
        const args: any[] = new Array(paramCount);

        for (const [index, varName] of Object.entries(pathVariables)) {
          const idx = Number(index);
          args[idx] = req.params[varName as string];
        }

        for (const index of Object.keys(requestBody)) {
          const idx = Number(index);
          args[idx] = req.body;
        }

        const result = await controllerMethod.apply(instance, args);
        console.log(`← ${reqLog} 200 (${Date.now() - start}ms)`);
        res.json({ success: true, data: result });
      } catch (error: any) {
        console.error(`← ${reqLog} 400 (${Date.now() - start}ms) ERROR: ${error.message}`);
        res.status(400).json({ success: false, error: error.message });
      }
    };

    switch (method) {
      case 'get': app.get(fullPath, handler); break;
      case 'post': app.post(fullPath, handler); break;
      case 'put': app.put(fullPath, handler); break;
      case 'delete': app.delete(fullPath, handler); break;
      case 'patch': app.patch(fullPath, handler); break;
    }
  }
}

registerController(UserController, userController);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🚀 API Server running at http://localhost:' + PORT);
  console.log('📚 API: http://localhost:' + PORT + '/api/users\n');
});
