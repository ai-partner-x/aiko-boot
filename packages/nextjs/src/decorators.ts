/**
 * Spring Boot Style API Decorators for Next.js
 * Web layer (MVC) - completely aligned with Spring Boot
 */
import 'reflect-metadata';
import { Injectable, Singleton, inject } from '@ai-first/di/server';

// Metadata keys
const CONTROLLER_METADATA = Symbol('controller');
const REQUEST_MAPPING_METADATA = Symbol('requestMapping');
const PATH_VARIABLE_METADATA = Symbol('pathVariable');
const REQUEST_PARAM_METADATA = Symbol('requestParam');
const REQUEST_BODY_METADATA = Symbol('requestBody');

/** 导出供 ApiContract 复用的元数据 key */
export { CONTROLLER_METADATA, REQUEST_MAPPING_METADATA };

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * @RestController options (like Spring Boot @RestController + @RequestMapping)
 */
export interface RestControllerOptions {
  /** Base path for all routes in this controller */
  path?: string;
  /** Controller description */
  description?: string;
}

/**
 * @RequestMapping options
 */
export interface RequestMappingOptions {
  /** Route path */
  path?: string;
  /** HTTP method */
  method?: HttpMethod;
  /** Operation description */
  description?: string;
}

/**
 * @RestController - Mark a class as REST controller
 * Equivalent to Spring Boot: @RestController + @RequestMapping("/api/users")
 */
export function RestController(options: RestControllerOptions = {}) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    // Save controller metadata
    Reflect.defineMetadata(CONTROLLER_METADATA, {
      ...options,
      className: target.name,
    }, target);
    
    // Auto inject constructor dependencies
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    paramTypes.forEach((type: any, index: number) => {
      inject(type)(target, undefined as any, index);
    });
    
    // Apply DI decorators
    Injectable()(target);
    Singleton()(target);
    
    return target;
  };
}

/**
 * @GetMapping - Map GET request (like Spring Boot @GetMapping)
 */
export function GetMapping(path: string = '', description?: string) {
  return RequestMapping({ path, method: 'GET', description });
}

/**
 * @PostMapping - Map POST request (like Spring Boot @PostMapping)
 */
export function PostMapping(path: string = '', description?: string) {
  return RequestMapping({ path, method: 'POST', description });
}

/**
 * @PutMapping - Map PUT request (like Spring Boot @PutMapping)
 */
export function PutMapping(path: string = '', description?: string) {
  return RequestMapping({ path, method: 'PUT', description });
}

/**
 * @DeleteMapping - Map DELETE request (like Spring Boot @DeleteMapping)
 */
export function DeleteMapping(path: string = '', description?: string) {
  return RequestMapping({ path, method: 'DELETE', description });
}

/**
 * @PatchMapping - Map PATCH request (like Spring Boot @PatchMapping)
 */
export function PatchMapping(path: string = '', description?: string) {
  return RequestMapping({ path, method: 'PATCH', description });
}

/**
 * @RequestMapping - Generic request mapping (like Spring Boot @RequestMapping)
 */
export function RequestMapping(options: RequestMappingOptions) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const mappings = Reflect.getMetadata(REQUEST_MAPPING_METADATA, target.constructor) || {};
    mappings[propertyKey] = options;
    Reflect.defineMetadata(REQUEST_MAPPING_METADATA, mappings, target.constructor);
    return descriptor;
  };
}

/**
 * @PathVariable - Extract path variable (like Spring Boot @PathVariable)
 */
export function PathVariable(name?: string) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const pathVars = Reflect.getMetadata(PATH_VARIABLE_METADATA, target, propertyKey) || {};
    pathVars[parameterIndex] = name || 'param' + parameterIndex;
    Reflect.defineMetadata(PATH_VARIABLE_METADATA, pathVars, target, propertyKey);
  };
}

/**
 * @RequestParam - Extract query parameter (like Spring Boot @RequestParam)
 */
export function RequestParam(name?: string, required: boolean = false) {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const requestParams = Reflect.getMetadata(REQUEST_PARAM_METADATA, target, propertyKey) || {};
    requestParams[parameterIndex] = { name: name || 'param' + parameterIndex, required };
    Reflect.defineMetadata(REQUEST_PARAM_METADATA, requestParams, target, propertyKey);
  };
}

/**
 * @QueryParam - Alias for @RequestParam
 */
export const QueryParam = RequestParam;

/**
 * @RequestBody - Extract request body (like Spring Boot @RequestBody)
 */
export function RequestBody() {
  return function (target: any, propertyKey: string, parameterIndex: number) {
    const requestBody = Reflect.getMetadata(REQUEST_BODY_METADATA, target, propertyKey) || {};
    requestBody[parameterIndex] = true;
    Reflect.defineMetadata(REQUEST_BODY_METADATA, requestBody, target, propertyKey);
  };
}

// ==================== Metadata Getters ====================

export function getControllerMetadata(target: any): RestControllerOptions | undefined {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
}

export function getRequestMappings(target: any): Record<string, RequestMappingOptions> {
  return Reflect.getMetadata(REQUEST_MAPPING_METADATA, target) || {};
}

export function getPathVariables(target: any, methodName: string): Record<number, string> {
  return Reflect.getMetadata(PATH_VARIABLE_METADATA, target, methodName) || {};
}

export function getRequestParams(target: any, methodName: string): Record<number, { name: string; required: boolean }> {
  return Reflect.getMetadata(REQUEST_PARAM_METADATA, target, methodName) || {};
}

export function getRequestBody(target: any, methodName: string): Record<number, boolean> {
  return Reflect.getMetadata(REQUEST_BODY_METADATA, target, methodName) || {};
}
