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
  container,
} from 'tsyringe';

// Re-export TSyringe decorators with our names
export const Injectable = tsyringeInjectable;
export const Inject = tsyringeInject;
export const inject = tsyringeInject;  // lowercase version
export const Singleton = tsyringeSingleton;
export const Scoped = tsyringeScoped;

// Metadata key for autowired properties (use string for ESM module isolation)
const AUTOWIRED_METADATA = 'aiko-boot:autowired';

interface AutowiredInfo {
  propertyKey: string;
  type: Function | undefined;
}

/**
 * @Autowired - Spring 风格的属性注入
 * 
 * @param type - 要注入的类型（可选，若不指定则从 metadata 获取）
 * 
 * @example
 * @Service()
 * class UserService {
 *   @Autowired(UserMapper)
 *   private userMapper!: UserMapper;
 * }
 */
export function Autowired(type?: Function) {
  return function (target: Object, propertyKey: string | symbol): void {
    const existingFields: AutowiredInfo[] = Reflect.getMetadata(AUTOWIRED_METADATA, target.constructor) || [];
    // 优先使用显式指定的类型，否则从 design:type 获取
    const propertyType = type || Reflect.getMetadata('design:type', target, propertyKey);
    
    existingFields.push({
      propertyKey: String(propertyKey),
      type: propertyType,
    });
    
    Reflect.defineMetadata(AUTOWIRED_METADATA, existingFields, target.constructor);
  };
}

/**
 * 获取类的 Autowired 属性列表
 */
export function getAutowiredProperties(target: Function): Array<{ propertyKey: string; type: Function }> {
  return Reflect.getMetadata(AUTOWIRED_METADATA, target) || [];
}

/**
 * 为实例注入所有 @Autowired 属性（递归处理依赖链）
 */
export function injectAutowiredProperties(instance: any, visited = new Set<any>()): void {
  if (visited.has(instance)) return;
  visited.add(instance);
  
  const autowiredProps = getAutowiredProperties(instance.constructor);
  
  for (const { propertyKey, type } of autowiredProps) {
    if (type && !instance[propertyKey]) {
      try {
        const dependency = container.resolve(type as any);
        instance[propertyKey] = dependency;
        injectAutowiredProperties(dependency, visited);
      } catch {
        // Autowire failed silently - dependency may not be registered
      }
    }
  }
}

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
