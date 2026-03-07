/**
 * @ai-first/nextjs
 * Spring Boot style HTTP decorators and Express router
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
  RequestPart,
  ModelAttribute,
  RequestAttribute,
  getControllerMetadata,
  getRequestMappings,
  getPathVariables,
  getRequestParams,
  getRequestBody,
  getRequestParts,
  getModelAttributes,
  getRequestAttributes,
  type RestControllerOptions,
  type RequestMappingOptions,
  type HttpMethod,
  type MultipartFile,
} from './decorators.js';

// Export Express router
export { createExpressRouter, type ExpressRouterOptions } from './express-router.js';

// Export Bootstrap (Spring Boot style auto-configuration)
export { createApp, type AppOptions, type DatabaseConnectionConfig } from './bootstrap.js';

// Export Feign-style API client (with reflect-metadata)
export {
  ApiContract,
  createApiClient,
  type ApiClientOptions,
} from './client.js';

// Export lite API client (no reflect-metadata, SSR safe)
export {
  createApiClientFromMeta,
  type ApiMetadata,
} from './client-lite.js';
