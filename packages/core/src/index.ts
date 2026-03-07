/**
 * @ai-first/core
 * Core domain layer decorators (DDD)
 * 
 * ORM decorators -> @ai-first/orm
 * Web decorators -> @ai-first/nextjs
 * Validation decorators -> @ai-first/validation
 */

// Export types
export * from './types.js';

// Export decorators
export {
  Component,
  Service,
  Transactional,
  Async,
  getComponentMetadata,
  getServiceMetadata,
  isTransactional,
  isAsync,
  getAsyncOptions,
} from './decorators.js';
