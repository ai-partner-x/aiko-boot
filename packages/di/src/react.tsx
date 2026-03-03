/**
 * React integration for DI
 */
import React, { createContext, useContext, useMemo } from 'react';
import { DependencyContainer, InjectionToken } from 'tsyringe';
import { Container } from './container.js';

/**
 * DI Context for React
 */
const DIContext = createContext<DependencyContainer | null>(null);

/**
 * DIProvider - Provide DI container to React component tree
 */
export interface DIProviderProps {
  children: React.ReactNode;
  container?: DependencyContainer;
}

export function DIProvider({ children, container }: DIProviderProps) {
  const diContainer = useMemo(() => container || Container.getContainer(), [container]);

  return <DIContext.Provider value={diContainer}>{children}</DIContext.Provider>;
}

/**
 * useContainer - Get the DI container
 */
export function useContainer(): DependencyContainer {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useContainer must be used within DIProvider');
  }
  return container;
}

/**
 * useInjection - Inject a dependency in React component
 */
export function useInjection<T>(token: InjectionToken<T>): T {
  const container = useContainer();
  return useMemo(() => container.resolve(token as any), [container, token]);
}

/**
 * useOptionalInjection - Inject an optional dependency
 */
export function useOptionalInjection<T>(token: InjectionToken<T>): T | null {
  const container = useContainer();
  return useMemo(() => {
    try {
      return container.resolve(token as any);
    } catch {
      return null;
    }
  }, [container, token]);
}
