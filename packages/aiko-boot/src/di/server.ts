/**
 * @ai-partner-x/aiko-boot/di/server
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
  Autowired,
  getAutowiredProperties,
  injectAutowiredProperties,
  registry,
} from './decorators.js';
