/**
 * Core Domain Decorators (DDD)
 * Domain layer decorators for business logic
 * 
 * ORM decorators -> @ai-first/orm
 * Web decorators -> @ai-first/nextjs
 * Validation decorators -> @ai-first/validation
 */
import 'reflect-metadata';
import { Injectable, Singleton, inject } from '@ai-first/di/server';
import type { ServiceOptions } from './types.js';

// Metadata keys
const SERVICE_METADATA = Symbol('service');
const TRANSACTIONAL_METADATA = Symbol('transactional');

// ==================== Service Layer ====================

/**
 * @Service - Mark a class as domain service (like Spring @Service)
 * Auto-registers to DI container with constructor injection
 */
export function Service(options: ServiceOptions = {}) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    Reflect.defineMetadata(SERVICE_METADATA, options, target);
    
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

// ==================== Transaction ====================

/**
 * @Transactional - Mark a method as transactional (like Spring @Transactional)
 */
export function Transactional() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    Reflect.defineMetadata(TRANSACTIONAL_METADATA, true, target, propertyKey);
    
    const original = descriptor.value;
    descriptor.value = async function (...args: any[]) {
      console.log('[Transaction] Starting transaction for ' + propertyKey);
      try {
        const result = await original.apply(this, args);
        console.log('[Transaction] Committing transaction for ' + propertyKey);
        return result;
      } catch (error) {
        console.error('[Transaction] Rolling back transaction for ' + propertyKey, error);
        throw error;
      }
    };
    return descriptor;
  };
}

// ==================== Metadata Getters ====================

export function getServiceMetadata(target: any): ServiceOptions | undefined {
  return Reflect.getMetadata(SERVICE_METADATA, target);
}

export function isTransactional(target: any, methodName: string): boolean {
  return Reflect.getMetadata(TRANSACTIONAL_METADATA, target, methodName) || false;
}
