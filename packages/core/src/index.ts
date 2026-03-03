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
  Service,
  Transactional,
  getServiceMetadata,
  isTransactional,
} from './decorators.js';
