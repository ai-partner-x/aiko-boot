/**
 * Auto Router - Spring Boot style automatic route registration
 * 
 * Usage:
 * // app/api/[...path]/route.ts
 * import { createApiRouter } from '@ai-first/nextjs';
 * import * as controllers from '@/lib/controller';
 * export const { GET, POST, PUT, DELETE, PATCH } = createApiRouter(controllers);
 */
import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@ai-first/di/server';
import {
  getControllerMetadata,
  getRequestMappings,
  getPathVariables,
  getRequestParams,
  getRequestBody,
  type HttpMethod,
} from './decorators.js';

interface RouteInfo {
  controller: new (...args: any[]) => any;
  methodName: string;
  path: string;
  pathRegex: RegExp;
  paramNames: string[];
}

/**
 * Controller Registry
 */
class ControllerRegistry {
  private routes: Map<HttpMethod, RouteInfo[]> = new Map();

  constructor() {
    this.routes.set('GET', []);
    this.routes.set('POST', []);
    this.routes.set('PUT', []);
    this.routes.set('DELETE', []);
    this.routes.set('PATCH', []);
  }

  register(ControllerClass: new (...args: any[]) => any): void {
    const metadata = getControllerMetadata(ControllerClass);
    if (!metadata) return; // Skip if not a controller
    
    const basePath = metadata.path || '';
    const mappings = getRequestMappings(ControllerClass);

    for (const [methodName, mapping] of Object.entries(mappings)) {
      const method = mapping.method || 'GET';
      const methodPath = mapping.path || '';
      const fullPath = this.normalizePath(basePath + methodPath);
      const { regex, paramNames } = this.pathToRegex(fullPath);

      const routes = this.routes.get(method) || [];
      routes.push({
        controller: ControllerClass,
        methodName,
        path: fullPath,
        pathRegex: regex,
        paramNames,
      });
      this.routes.set(method, routes);
    }
  }

  findRoute(method: HttpMethod, path: string): { route: RouteInfo; params: Record<string, string> } | null {
    const routes = this.routes.get(method) || [];
    const normalizedPath = this.normalizePath(path);

    for (const route of routes) {
      const match = normalizedPath.match(route.pathRegex);
      if (match) {
        const params: Record<string, string> = {};
        route.paramNames.forEach((name, index) => {
          params[name] = match[index + 1];
        });
        return { route, params };
      }
    }
    return null;
  }

  private normalizePath(path: string): string {
    let normalized = path.replace(/\/+$/, '');
    if (!normalized.startsWith('/')) {
      normalized = '/' + normalized;
    }
    return normalized;
  }

  private pathToRegex(path: string): { regex: RegExp; paramNames: string[] } {
    const paramNames: string[] = [];
    const regexStr = path.replace(/:([^/]+)/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    }).replace(/\{([^}]+)\}/g, (_, paramName) => {
      paramNames.push(paramName);
      return '([^/]+)';
    });
    return {
      regex: new RegExp('^' + regexStr + '$'),
      paramNames,
    };
  }
}

/**
 * Create API router from controller module exports
 * 
 * @example
 * import * as controllers from '@/lib/controller';
 * export const { GET, POST, PUT, DELETE, PATCH } = createApiRouter(controllers);
 */
export function createApiRouter(
  controllers: Record<string, any> | Array<new (...args: any[]) => any>
) {
  const registry = new ControllerRegistry();
  
  // Support both array and module exports
  if (Array.isArray(controllers)) {
    controllers.forEach(ctrl => registry.register(ctrl));
  } else {
    Object.values(controllers).forEach(exported => {
      if (typeof exported === 'function' && exported.prototype) {
        registry.register(exported);
      }
    });
  }

  const createHandler = (method: HttpMethod) => {
    return async (req: NextRequest, context?: { params?: Promise<Record<string, string[]>> }) => {
      try {
        let pathname = req.nextUrl.pathname;
        
        if (context?.params) {
          const resolvedParams = await context.params;
          if (resolvedParams.path) {
            pathname = '/' + resolvedParams.path.join('/');
          }
        }

        const match = registry.findRoute(method, pathname);
        if (!match) {
          return NextResponse.json(
            { success: false, error: 'Not Found: ' + method + ' ' + pathname },
            { status: 404 }
          );
        }

        const { route, params } = match;
        const controller = Container.resolve<any>(route.controller);
        const args = await extractParameters(req, params, route.controller, route.methodName);
        const methodFn = controller[route.methodName] as (...args: any[]) => Promise<any>;
        const result = await methodFn.apply(controller, args);

        return NextResponse.json({ success: true, data: result });
      } catch (error: any) {
        console.error('[Router] Error:', error);
        return NextResponse.json(
          { success: false, error: error.message || 'Internal Server Error' },
          { status: error.statusCode || 500 }
        );
      }
    };
  };

  return {
    GET: createHandler('GET'),
    POST: createHandler('POST'),
    PUT: createHandler('PUT'),
    DELETE: createHandler('DELETE'),
    PATCH: createHandler('PATCH'),
  };
}

async function extractParameters(
  req: NextRequest,
  pathParams: Record<string, string>,
  ControllerClass: new (...args: any[]) => any,
  methodName: string
): Promise<any[]> {
  const pathVars = getPathVariables(ControllerClass.prototype, methodName);
  const requestParams = getRequestParams(ControllerClass.prototype, methodName);
  const requestBody = getRequestBody(ControllerClass.prototype, methodName);

  const methodFn = ControllerClass.prototype[methodName] as (...args: any[]) => any;
  const paramCount = methodFn.length;
  const params: any[] = new Array(paramCount);

  for (const [index, varName] of Object.entries(pathVars)) {
    params[Number(index)] = pathParams[varName as string];
  }

  const searchParams = req.nextUrl.searchParams;
  for (const [index, paramInfo] of Object.entries(requestParams)) {
    const info = paramInfo as { name: string; required: boolean };
    const value = searchParams.get(info.name);
    if (info.required && !value) {
      throw new Error('Required parameter ' + info.name + ' is missing');
    }
    params[Number(index)] = value;
  }

  for (const [index] of Object.entries(requestBody)) {
    try {
      params[Number(index)] = await req.json();
    } catch {
      params[Number(index)] = null;
    }
  }

  return params;
}
