/**
 * @ai-first/api-starter
 *
 * 开箱即用的 API 开发套件，一个包搞定所有 API 开发依赖
 *
 * @example
 * ```typescript
 * import {
 *   // 核心装饰器
 *   RestController, GetMapping, PostMapping, PutMapping, DeleteMapping,
 *   PathVariable, RequestBody, QueryParam,
 *   // ORM 装饰器
 *   Entity, PrimaryGeneratedColumn, Column,
 *   // 校验装饰器
 *   IsString, IsEmail, IsOptional, Min, Max,
 *   // 依赖注入
 *   AppService, Inject,
 *   // Express
 *   express, cors,
 * } from '@ai-first/api-starter';
 * ```
 */

// reflect-metadata 必须最先导入
import 'reflect-metadata';

// ==================== @ai-first/core ====================
export {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
  QueryParam,
} from '@ai-first/core';

// ==================== @ai-first/orm ====================
export {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from '@ai-first/orm';

// ==================== @ai-first/validation ====================
export {
  IsString,
  IsEmail,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  Min,
  Max,
  MinLength,
  MaxLength,
  validate,
} from '@ai-first/validation';

// ==================== @ai-first/di ====================
export {
  AppService,
  Inject,
  Container,
} from '@ai-first/di';

// ==================== @ai-first/nextjs ====================
export {
  createExpressApp,
  registerController,
} from '@ai-first/nextjs';

// ==================== Express ====================
export { default as express } from 'express';
export type { Request, Response, NextFunction, Application } from 'express';
export { default as cors } from 'cors';
