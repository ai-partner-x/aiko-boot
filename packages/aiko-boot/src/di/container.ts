/**
 * DI Container - Wrapper around TSyringe
 */
import 'reflect-metadata';
import { container as tsyringeContainer, DependencyContainer, InjectionToken, Lifecycle as TSyringeLifecycle } from 'tsyringe';

/**
 * Lifecycle scope for dependencies
 */
export enum Lifecycle {
  /** Single instance for entire application */
  Singleton = 'singleton',
  /** New instance per request/scope */
  Scoped = 'scoped',
  /** New instance every time */
  Transient = 'transient',
}

/**
 * Container - Main DI container
 */
export class Container {
  private static instance: DependencyContainer = tsyringeContainer;

  /**
   * Register a class with specific lifecycle
   */
  static register<T>(
    token: InjectionToken<T>,
    target: new (...args: any[]) => T,
    lifecycle: Lifecycle = Lifecycle.Transient
  ): void {
    switch (lifecycle) {
      case Lifecycle.Singleton:
        this.instance.registerSingleton(token as any, target as any);
        break;
      case Lifecycle.Scoped:
        // TSyringe uses register with lifecycle option for scoped
        this.instance.register(token as any, { useClass: target as any }, { lifecycle: TSyringeLifecycle.ContainerScoped });
        break;
      case Lifecycle.Transient:
      default:
        this.instance.register(token as any, { useClass: target as any });
        break;
    }
  }

  /**
   * Register an instance directly
   */
  static registerInstance<T>(token: InjectionToken<T>, instance: T): void {
    this.instance.registerInstance(token as any, instance);
  }

  /**
   * Register multiple services at once
   */
  static registerAll(
    services: Array<{
      token: InjectionToken<any>;
      target: new (...args: any[]) => any;
      lifecycle?: Lifecycle;
    }>
  ): void {
    services.forEach(({ token, target, lifecycle }) => {
      this.register(token, target, lifecycle);
    });
  }

  /**
   * Resolve a dependency
   */
  static resolve<T>(token: InjectionToken<T>): T {
    return this.instance.resolve(token as any);
  }

  /**
   * Check if a token is registered
   */
  static isRegistered<T>(token: InjectionToken<T>): boolean {
    return this.instance.isRegistered(token as any);
  }

  /**
   * Clear all registrations (useful for testing)
   */
  static clearAll(): void {
    this.instance.clearInstances();
  }

  /**
   * Create a child container (for scoped dependencies)
   */
  static createChildContainer(): DependencyContainer {
    return this.instance.createChildContainer();
  }

  /**
   * Get the underlying TSyringe container
   */
  static getContainer(): DependencyContainer {
    return this.instance;
  }
}
