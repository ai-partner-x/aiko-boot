/**
 * @ai-first/api-starter
 *
 * 开箱即用的 API 开发套件，一个包搞定所有 API 开发依赖
 *
 * @example
 * ```typescript
 * import {
 *   // Web 装饰器
 *   RestController, GetMapping, PostMapping, PutMapping, DeleteMapping,
 *   PathVariable, RequestBody, QueryParam,
 *   // ORM 装饰器
 *   Entity, Column, TableId, TableField,
 *   // 校验装饰器
 *   IsString, IsEmail, IsOptional, Min, Max,
 *   // 依赖注入
 *   Injectable, Inject,
 *   // Express
 *   express, cors,
 * } from '@ai-first/api-starter';
 * ```
 */

// reflect-metadata 必须最先导入
import 'reflect-metadata';

// ==================== @ai-first/core ====================
export {
  Service,
  Transactional,
  getServiceMetadata,
  isTransactional,
} from '@ai-first/core';

// ==================== @ai-first/nextjs (Web 装饰器) ====================
export {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PatchMapping,
  RequestMapping,
  PathVariable,
  RequestParam,
  QueryParam,
  RequestBody,
  createRouteHandler,
  createRouteHandlers,
  createApiRouter,
  createApiClient,
  createApiClientFromMeta,
  type RestControllerOptions,
  type RequestMappingOptions,
  type HttpMethod,
  type ApiClientOptions,
  type ApiMetadata,
} from '@ai-first/nextjs';

// ==================== @ai-first/orm ====================
export {
  Entity,
  TableName,
  TableId,
  TableField,
  Column,
  Mapper,
  BaseMapper,
  InMemoryAdapter,
  PostgresAdapter,
  type EntityOptions,
  type TableIdOptions,
  type TableFieldOptions,
  type MapperOptions,
  type PostgresConfig,
} from '@ai-first/orm';

// ==================== @ai-first/validation ====================
export {
  // Presence
  IsDefined,
  IsOptional,
  // Type
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  IsDate,
  IsEnum,
  // String
  IsNotEmpty,
  Length,
  MinLength,
  MaxLength,
  Matches,
  // Number
  Min,
  Max,
  IsPositive,
  IsNegative,
  // Format
  IsEmail,
  IsUrl,
  IsUUID,
  // Nested
  ValidateNested,
  // Core
  validate,
  validateSync,
  validateOrReject,
  ValidationError,
  // Utils
  validateDto,
  createResolver,
  plainToInstance,
  instanceToPlain,
  Type,
} from '@ai-first/validation';

// ==================== @ai-first/di ====================
export {
  Container,
  Lifecycle,
  Injectable,
  Inject,
  inject,
  Singleton,
  Scoped,
  AutoRegister,
  registry,
} from '@ai-first/di';

// ==================== Express ====================
export { default as express } from 'express';
export type { Request, Response, NextFunction, Application } from 'express';
export { default as cors } from 'cors';
