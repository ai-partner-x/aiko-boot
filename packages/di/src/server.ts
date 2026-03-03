/**
 * @ai-first/di/server
 * Server-side DI exports (no React dependencies)
 * Use this in Server Components, Server Actions, API Routes
 */

// Re-export TSyringe core types
export type { DependencyContainer, InjectionToken } from 'tsyringe';

// Export container wrapper
export { Container, Lifecycle } from './container.js';

// Export decorators
export {
  Injectable,
  Inject,
  inject,
  Singleton,
  Scoped,
  AutoRegister,
  registry,
} from './decorators.js';
