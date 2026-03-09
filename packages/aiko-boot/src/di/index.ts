/**
 * @ai-partner-x/aiko-boot/di
 * Dependency Injection container based on TSyringe
 */

// Re-export TSyringe core types
export type { DependencyContainer, InjectionToken } from 'tsyringe';

// Export our container wrapper
export { Container, Lifecycle } from './container.js';

// Export decorators (including lowercase inject)
export {
  Injectable,
  Inject,
  inject,  // lowercase version for auto-injection
  Singleton,
  Scoped,
  AutoRegister,
  Autowired,
  getAutowiredProperties,
  injectAutowiredProperties,
  registry,
} from './decorators.js';

// Export React integration
export {
  DIProvider,
  useContainer,
  useInjection,
  useOptionalInjection,
  type DIProviderProps,
} from './react.js';
