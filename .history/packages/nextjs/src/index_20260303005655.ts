/**
 * @ai-first/nextjs
 * Spring Boot style decorators and utilities for Next.js
 */

// Export decorators
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
  getControllerMetadata,
  getRequestMappings,
  getPathVariables,
  getRequestParams,
  getRequestBody,
  type RestControllerOptions,
  type RequestMappingOptions,
  type HttpMethod,
} from './decorators.js';

// Export route handler utilities
export { createRouteHandler, createRouteHandlers } from './route-handler.js';

// Export auto router
export { createApiRouter } from './router.js';

// Export Feign-style API client
export {
  ApiContract,
  createApiClient,
  type ApiClientOptions,
} from './client.js';
