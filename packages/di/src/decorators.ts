/**
 * DI Decorators - Re-export and extend TSyringe decorators
 */
import 'reflect-metadata';
import {
  injectable as tsyringeInjectable,
  inject as tsyringeInject,
  singleton as tsyringeSingleton,
  scoped as tsyringeScoped,
  registry,
  Lifecycle,
} from 'tsyringe';

// Re-export TSyringe decorators with our names
export const Injectable = tsyringeInjectable;
export const Inject = tsyringeInject;
export const inject = tsyringeInject;  // lowercase version
export const Singleton = tsyringeSingleton;
export const Scoped = tsyringeScoped;

/**
 * @AutoRegister - Automatically register a class when decorated
 */
export function AutoRegister(options: { lifecycle?: 'singleton' | 'scoped' | 'transient' } = {}) {
  return function <T extends { new (...args: any[]): {} }>(target: T) {
    tsyringeInjectable()(target);

    switch (options.lifecycle) {
      case 'singleton':
        tsyringeSingleton()(target);
        break;
      case 'scoped':
        tsyringeScoped(Lifecycle.ContainerScoped)(target);
        break;
      case 'transient':
      default:
        break;
    }

    return target;
  };
}

export { registry, Lifecycle };
