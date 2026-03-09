/**
 * Exception Handling - Spring Boot Style Global Exception Handler
 * 
 * 支持:
 * 1. @ControllerAdvice - 全局控制器增强
 * 2. @ExceptionHandler - 异常处理方法
 * 3. @ResponseStatus - 设置响应状态码
 * 4. BusinessException - 业务异常基类
 * 5. ExceptionHandlerRegistry - 异常处理器注册表
 * 
 * @example
 * ```typescript
 * @ControllerAdvice()
 * export class GlobalExceptionHandler {
 *   @ExceptionHandler(ValidationError)
 *   @ResponseStatus(400)
 *   handleValidation(error: ValidationError) {
 *     return { code: 'VALIDATION_ERROR', message: error.message, fields: error.fields };
 *   }
 *   
 *   @ExceptionHandler(NotFoundError)
 *   @ResponseStatus(404)
 *   handleNotFound(error: NotFoundError) {
 *     return { code: 'NOT_FOUND', message: error.message };
 *   }
 * }
 * ```
 */
import 'reflect-metadata';
import { Injectable, Singleton } from '../di/server.js';
import { Container } from '../di/server.js';

// Metadata keys (使用字符串而非 Symbol，以便跨 ESM 模块共享)
const CONTROLLER_ADVICE_METADATA = 'aiko-boot:controllerAdvice';
const EXCEPTION_HANDLER_METADATA = 'aiko-boot:exceptionHandler';
const RESPONSE_STATUS_METADATA = 'aiko-boot:responseStatus';

// 异常处理器定义
interface ExceptionHandlerDefinition {
  methodName: string;
  exceptionTypes: Function[];
  statusCode?: number;
  order: number;
}

// 已注册的 ControllerAdvice
const controllerAdviceClasses: Array<{
  target: Function;
  order: number;
  basePackages?: string[];
}> = [];

/**
 * @ControllerAdvice - 全局控制器增强
 * 
 * 用于定义全局异常处理、数据绑定、模型属性等
 * 
 * @example
 * ```typescript
 * @ControllerAdvice()
 * export class GlobalExceptionHandler {
 *   @ExceptionHandler(Error)
 *   handleGenericError(error: Error) {
 *     return { code: 'INTERNAL_ERROR', message: error.message };
 *   }
 * }
 * ```
 */
export function ControllerAdvice(options: {
  /** 处理顺序，数字越小越先处理 */
  order?: number;
  /** 限制应用范围的包路径 */
  basePackages?: string[];
} = {}) {
  return function <T extends { new (...args: any[]): any }>(target: T) {
    const { order = 0, basePackages } = options;
    
    Reflect.defineMetadata(CONTROLLER_ADVICE_METADATA, {
      className: target.name,
      order,
      basePackages,
    }, target);

    // 注册到全局列表
    controllerAdviceClasses.push({ target, order, basePackages });

    // Apply DI decorators
    Injectable()(target);
    Singleton()(target);

    return target;
  };
}

/**
 * @ExceptionHandler - 异常处理方法
 * 
 * @param exceptionTypes - 要处理的异常类型
 * 
 * @example
 * ```typescript
 * @ExceptionHandler(ValidationError)
 * handleValidation(error: ValidationError) {
 *   return { code: 'VALIDATION_ERROR', details: error.details };
 * }
 * 
 * // 处理多种异常
 * @ExceptionHandler([NotFoundError, GoneError])
 * handleNotFound(error: NotFoundError | GoneError) {
 *   return { code: 'RESOURCE_ERROR', message: error.message };
 * }
 * ```
 */
export function ExceptionHandler(exceptionTypes: Function | Function[], options: { order?: number } = {}) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const { order = 0 } = options;
    const types = Array.isArray(exceptionTypes) ? exceptionTypes : [exceptionTypes];
    const statusCode = Reflect.getMetadata(RESPONSE_STATUS_METADATA, target, propertyKey);
    
    const handlers: ExceptionHandlerDefinition[] = Reflect.getMetadata(EXCEPTION_HANDLER_METADATA, target.constructor) || [];
    handlers.push({
      methodName: propertyKey,
      exceptionTypes: types,
      statusCode,
      order,
    });
    Reflect.defineMetadata(EXCEPTION_HANDLER_METADATA, handlers, target.constructor);

    return descriptor;
  };
}

/**
 * @ResponseStatus - 设置响应状态码
 * 
 * @param code - HTTP 状态码
 * 
 * @example
 * ```typescript
 * @ExceptionHandler(NotFoundError)
 * @ResponseStatus(404)
 * handleNotFound(error: NotFoundError) {
 *   return { message: 'Resource not found' };
 * }
 * ```
 */
export function ResponseStatus(code: number) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(RESPONSE_STATUS_METADATA, code, target, propertyKey);
    return descriptor;
  };
}

/**
 * 业务异常基类
 */
export class BusinessException extends Error {
  constructor(
    message: string,
    public readonly code: string = 'BUSINESS_ERROR',
    public readonly statusCode: number = 400,
    public readonly details?: any
  ) {
    super(message);
    this.name = 'BusinessException';
  }
}

/**
 * 验证异常
 */
export class ValidationException extends BusinessException {
  constructor(
    message: string,
    public readonly fields: Record<string, string[]> = {}
  ) {
    super(message, 'VALIDATION_ERROR', 400, { fields });
    this.name = 'ValidationException';
  }
}

/**
 * 资源未找到异常
 */
export class NotFoundException extends BusinessException {
  constructor(message: string = 'Resource not found', public readonly resource?: string) {
    super(message, 'NOT_FOUND', 404, { resource });
    this.name = 'NotFoundException';
  }
}

/**
 * 未授权异常
 */
export class UnauthorizedException extends BusinessException {
  constructor(message: string = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedException';
  }
}

/**
 * 禁止访问异常
 */
export class ForbiddenException extends BusinessException {
  constructor(message: string = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenException';
  }
}

/**
 * 冲突异常（如唯一约束冲突）
 */
export class ConflictException extends BusinessException {
  constructor(message: string = 'Conflict') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictException';
  }
}

/**
 * 异常处理结果
 */
export interface ExceptionHandlerResult {
  handled: boolean;
  statusCode: number;
  body: any;
}

/**
 * 异常处理器注册表
 */
export class ExceptionHandlerRegistry {
  private static handlers: Array<{
    target: Function;
    handler: ExceptionHandlerDefinition;
    order: number;
  }> = [];
  
  private static initialized = false;

  /**
   * 初始化所有异常处理器
   */
  static initialize(): void {
    if (this.initialized) return;

    // 按 order 排序 ControllerAdvice
    const sorted = [...controllerAdviceClasses].sort((a, b) => a.order - b.order);

    for (const { target } of sorted) {
      const handlers = getExceptionHandlers(target);
      for (const handler of handlers) {
        this.handlers.push({
          target,
          handler,
          order: handler.order,
        });
      }
    }

    this.initialized = true;
  }

  /**
   * 处理异常
   */
  static async handle(error: Error): Promise<ExceptionHandlerResult> {
    this.initialize();

    // 查找匹配的处理器
    for (const { target, handler } of this.handlers) {
      for (const exceptionType of handler.exceptionTypes) {
        if (error instanceof (exceptionType as any)) {
          try {
            const instance = Container.resolve(target as any);
            const method = (instance as any)[handler.methodName];
            const result = await method.call(instance, error);
            
            // 确定状态码
            let statusCode = handler.statusCode || 500;
            if (error instanceof BusinessException) {
              statusCode = handler.statusCode || error.statusCode;
            }

            return {
              handled: true,
              statusCode,
              body: result,
            };
          } catch (e) {
            console.error(`[aiko-boot] Exception handler error: ${(e as Error).message}`);
          }
        }
      }
    }

    // 未找到处理器，使用默认处理
    return this.defaultHandle(error);
  }

  /**
   * 默认异常处理
   */
  private static defaultHandle(error: Error): ExceptionHandlerResult {
    if (error instanceof BusinessException) {
      return {
        handled: true,
        statusCode: error.statusCode,
        body: {
          success: false,
          code: error.code,
          message: error.message,
          details: error.details,
        },
      };
    }

    // 未知异常
    return {
      handled: true,
      statusCode: 500,
      body: {
        success: false,
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : error.message,
      },
    };
  }

  /**
   * 清除注册表（用于测试）
   */
  static clear(): void {
    this.handlers = [];
    this.initialized = false;
    controllerAdviceClasses.length = 0;
  }
}

/**
 * 获取 ControllerAdvice 元数据
 */
export function getControllerAdviceMetadata(target: any): {
  className: string;
  order: number;
  basePackages?: string[];
} | undefined {
  return Reflect.getMetadata(CONTROLLER_ADVICE_METADATA, target);
}

/**
 * 获取异常处理器列表
 */
export function getExceptionHandlers(target: Function): ExceptionHandlerDefinition[] {
  return Reflect.getMetadata(EXCEPTION_HANDLER_METADATA, target) || [];
}

/**
 * 获取响应状态码
 */
export function getResponseStatus(target: any, methodName: string): number | undefined {
  return Reflect.getMetadata(RESPONSE_STATUS_METADATA, target, methodName);
}

/**
 * 获取所有 ControllerAdvice 类
 */
export function getControllerAdviceClasses(): Array<{
  target: Function;
  order: number;
}> {
  return controllerAdviceClasses;
}

/**
 * Express/Koa 错误处理中间件工厂
 */
export function createErrorHandler() {
  return async (err: Error, _req: any, res: any, _next: any) => {
    const result = await ExceptionHandlerRegistry.handle(err);
    
    res.status(result.statusCode).json(result.body);
  };
}
