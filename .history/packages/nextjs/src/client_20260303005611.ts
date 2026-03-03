/**
 * API Client Generator - TypeScript 版 Feign Client
 *
 * 使用方式：
 *   const userApi = createApiClient(UserApi, { baseUrl: 'http://localhost:3001' });
 *   const users = await userApi.list();
 *   const user  = await userApi.create({ username: 'test', email: 'test@test.com' });
 *
 * 原理：读取 @ApiContract + @GetMapping 等装饰器的 Reflect 元数据，
 *       自动将方法调用转换为对应的 fetch HTTP 请求。
 *       与 Java Feign Client 模式完全对应。
 */
import 'reflect-metadata';
import {
  getControllerMetadata,
  getRequestMappings,
  getPathVariables,
  getRequestBody,
  getRequestParams,
  type RestControllerOptions,
} from './decorators.js';

// ==================== ApiContract 装饰器 ====================

/**
 * @ApiContract - 标记 API 契约类（等同于 @RestController，但不注册 DI）
 * 用于在前后端共享包（@user-crud/types）中定义 API 结构契约，
 * 前端通过 createApiClient 消费，后端 Controller 实现该契约。
 *
 * 类比 Java：@FeignClient 注解的接口定义
 */
export function ApiContract(options: RestControllerOptions = {}) {
  return function <T extends { new (...args: any[]): object }>(target: T) {
    // 只写入 controller 元数据，不做任何 DI 注册（前端安全）
    Reflect.defineMetadata(
      // 复用与 @RestController 相同的 Symbol key，保证 getControllerMetadata 可读
      Symbol.for('controller'),
      { ...options, className: target.name },
      target,
    );
    return target;
  };
}

// ==================== createApiClient ====================

export interface ApiClientOptions {
  /** API 服务器基础 URL，例如 http://localhost:3001 */
  baseUrl: string;
  /** 附加请求头 */
  headers?: Record<string, string>;
}

type ApiClientMethod<T> = T extends (...args: infer A) => infer R ? (...args: A) => R : never;

type ApiClient<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => Promise<any>
    ? ApiClientMethod<T[K]>
    : never;
};

/**
 * createApiClient - 读取 @ApiContract / @RestController 元数据，
 * 生成类型安全的 fetch HTTP 客户端。
 *
 * 类比 Java：Feign 根据 @FeignClient 接口自动生成代理实现。
 *
 * @example
 * const userApi = createApiClient(UserApi, { baseUrl: 'http://localhost:3001' });
 * const users = await userApi.list();
 * const user  = await userApi.create({ username: 'test', email: 'x@x.com' });
 */
export function createApiClient<T extends object>(
  ApiClass: new (...args: any[]) => T,
  options: ApiClientOptions,
): ApiClient<T> {
  const { baseUrl, headers: extraHeaders = {} } = options;

  // 读取 @RestController / @ApiContract 元数据
  const controllerMeta = getControllerMetadata(ApiClass);
  const basePath = controllerMeta?.path ?? '';

  // 读取所有 @GetMapping / @PostMapping 等方法映射
  const mappings = getRequestMappings(ApiClass);

  const client: Record<string, (...args: any[]) => Promise<unknown>> = {};

  for (const [methodName, mapping] of Object.entries(mappings)) {
    const httpMethod = mapping.method ?? 'GET';
    const pathTemplate = mapping.path ?? '';

    client[methodName] = async (...args: any[]): Promise<unknown> => {
      // --- 1. 解析路径参数 ---
      const pathVars = getPathVariables(ApiClass.prototype, methodName);
      let path = basePath + pathTemplate;
      for (const [index, varName] of Object.entries(pathVars)) {
        const value = args[Number(index)];
        path = path.replace(`:${varName}`, encodeURIComponent(String(value)));
      }

      // --- 2. 解析查询参数 ---
      const queryParams = getRequestParams(ApiClass.prototype, methodName);
      const searchParams = new URLSearchParams();
      for (const [index, paramInfo] of Object.entries(queryParams)) {
        const value = args[Number(index)];
        if (value !== undefined && value !== null) {
          searchParams.set(paramInfo.name, String(value));
        }
      }
      const queryString = searchParams.toString();
      const fullUrl = `${baseUrl}/api${path}${queryString ? `?${queryString}` : ''}`;

      // --- 3. 解析 RequestBody ---
      const requestBodyMeta = getRequestBody(ApiClass.prototype, methodName);
      let body: BodyInit | undefined;
      for (const [index] of Object.entries(requestBodyMeta)) {
        const value = args[Number(index)];
        if (value !== undefined) {
          body = JSON.stringify(value);
        }
      }

      // --- 4. 发起 fetch 请求 ---
      const res = await fetch(fullUrl, {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          ...extraHeaders,
        },
        body,
      });

      const json = await res.json() as { success: boolean; data?: unknown; error?: string };

      if (!json.success) {
        throw new Error(json.error ?? `API call failed: ${httpMethod} ${fullUrl}`);
      }

      return json.data;
    };
  }

  return client as ApiClient<T>;
}
