/**
 * Next.js Route Handler Generator
 * Convert Controller methods to Next.js route handlers
 */
import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@ai-first/di/server';
import {
  getRequestMappings,
  getPathVariables,
  getRequestParams,
  getRequestBody,
} from './decorators.js';

/**
 * Create Next.js route handler from controller class and method
 */
export function createRouteHandler(
  ControllerClass: new (...args: any[]) => any,
  methodName: string
): (req: NextRequest, context?: any) => Promise<NextResponse> {
  return async (req: NextRequest, context?: any) => {
    try {
      // 1. Resolve controller from DI container
      const controller = Container.resolve<any>(ControllerClass);

      // 2. Extract parameters
      const params = await extractParameters(req, context, ControllerClass, methodName);

      // 3. Call controller method
      const method = controller[methodName] as (...args: any[]) => Promise<any>;
      const result = await method.apply(controller, params);

      // 4. Return response
      return NextResponse.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('[RouteHandler] Error in ' + ControllerClass.name + '.' + methodName + ':', error);
      return NextResponse.json(
        {
          success: false,
          error: error.message || 'Internal Server Error',
        },
        { status: error.statusCode || 500 }
      );
    }
  };
}

/**
 * Extract parameters from request
 */
async function extractParameters(
  req: NextRequest,
  context: any,
  ControllerClass: new (...args: any[]) => any,
  methodName: string
): Promise<any[]> {
  const pathVars = getPathVariables(ControllerClass.prototype, methodName);
  const requestParams = getRequestParams(ControllerClass.prototype, methodName);
  const requestBody = getRequestBody(ControllerClass.prototype, methodName);

  // Get method parameter count
  const methodFn = ControllerClass.prototype[methodName] as (...args: any[]) => any;
  const paramCount = methodFn.length;
  const params: any[] = new Array(paramCount);

  // Extract path variables
  if (context?.params) {
    const resolvedParams = await context.params;
    for (const [index, varName] of Object.entries(pathVars)) {
      const idx = Number(index);
      params[idx] = resolvedParams[varName as string];
    }
  }

  // Extract query parameters
  const searchParams = req.nextUrl.searchParams;
  for (const [index, paramInfo] of Object.entries(requestParams)) {
    const idx = Number(index);
    const info = paramInfo as { name: string; required: boolean };
    const value = searchParams.get(info.name);
    
    if (info.required && !value) {
      throw new Error('Required parameter ' + info.name + ' is missing');
    }
    
    params[idx] = value;
  }

  // Extract request body
  for (const [index] of Object.entries(requestBody)) {
    const idx = Number(index);
    try {
      const body = await req.json();
      params[idx] = body;
    } catch {
      params[idx] = null;
    }
  }

  return params;
}

/**
 * Create route handlers for all methods in a controller
 */
export function createRouteHandlers(ControllerClass: new (...args: any[]) => any): Record<string, any> {
  const mappings = getRequestMappings(ControllerClass);
  const handlers: Record<string, any> = {};

  for (const [methodName, mapping] of Object.entries(mappings)) {
    const method = mapping.method || 'GET';
    handlers[method] = createRouteHandler(ControllerClass, methodName);
  }

  return handlers;
}
