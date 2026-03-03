/**
 * API Client (无 reflect-metadata 依赖版本)
 *
 * 适用于 Next.js SSR 环境，不依赖装饰器
 */

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
 * API 元数据类型定义
 * 用于代码生成时产生的静态元数据对象
 */
export interface ApiMetadata {
  basePath: string;
  methods: {
    [methodName: string]: {
      method: string;
      path: string;
      params: { name: string; decorator: string; decoratorArg: string }[];
    };
  };
}

/**
 * createApiClientFromMeta - 基于静态元数据对象创建 API 客户端
 *
 * 与 createApiClient 不同，这个函数不依赖装饰器和 reflect-metadata，
 * 适合在 Next.js 等 SSR 环境中使用。
 *
 * @example
 * const userApi = createApiClientFromMeta(UserControllerMeta, UserController, { baseUrl: '...' });
 * const users = await userApi.list();
 */
export function createApiClientFromMeta<T extends object>(
  meta: ApiMetadata,
  _ApiClass: new (...args: any[]) => T, // 仅用于类型推导
  options: ApiClientOptions,
): ApiClient<T> {
  const { baseUrl, headers: extraHeaders = {} } = options;
  const { basePath, methods } = meta;

  const client: Record<string, (...args: any[]) => Promise<unknown>> = {};

  for (const [methodName, methodMeta] of Object.entries(methods)) {
    const httpMethod = methodMeta.method;
    const pathTemplate = methodMeta.path;
    const paramsMeta = methodMeta.params;

    client[methodName] = async (...args: any[]): Promise<unknown> => {
      let path = basePath + pathTemplate;
      let body: BodyInit | undefined;
      const searchParams = new URLSearchParams();

      // 根据参数元数据处理参数
      paramsMeta.forEach((param, index) => {
        const value = args[index];
        if (param.decorator === 'PathVariable' && param.decoratorArg) {
          path = path.replace(`:${param.decoratorArg}`, encodeURIComponent(String(value)));
        } else if (param.decorator === 'RequestParam' && param.decoratorArg) {
          if (value !== undefined && value !== null) {
            searchParams.set(param.decoratorArg, String(value));
          }
        } else if (param.decorator === 'RequestBody') {
          if (value !== undefined) {
            body = JSON.stringify(value);
          }
        }
      });

      const queryString = searchParams.toString();
      const fullUrl = `${baseUrl}/api${path}${queryString ? `?${queryString}` : ''}`;

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
