import * as React from 'react';
import type { User, Role, Permission } from './entities/index.js';

interface UserRole extends Role {
  permissions?: Permission[];
}

interface UserWithRoles extends User {
  roles?: UserRole[];
}

interface SecurityContextValue {
  user: User | null;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const SecurityContext = React.createContext<SecurityContextValue | undefined>(undefined);

interface SecurityProviderProps {
  children: React.ReactNode;
  apiUrl?: string;
  tokenKey?: string;
}

export function SecurityProvider(props: SecurityProviderProps): React.ReactElement {
  const { children, apiUrl, tokenKey } = props;
  const finalApiUrl = apiUrl || '/api/auth';
  const finalTokenKey = tokenKey || 'auth_token';

  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(function () {
    const token = localStorage.getItem(finalTokenKey);
    if (token) {
      fetchUserInfo(token);
    }
  }, []);

  async function fetchUserInfo(token: string): Promise<void> {
    try {
      const response = await fetch(finalApiUrl + '/me', {
        headers: {
          'Authorization': 'Bearer ' + token,
        },
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem(finalTokenKey);
      }
    } catch {
      localStorage.removeItem(finalTokenKey);
    }
  }

  async function login(username: string, password: string): Promise<void> {
    const response = await fetch(finalApiUrl + '/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: username, password: password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    localStorage.setItem(finalTokenKey, data.token);
    setUser(data.user);
  }

  async function logout(): Promise<void> {
    localStorage.removeItem(finalTokenKey);
    setUser(null);
  }

  function hasRole(role: string): boolean {
    const userWithRoles = user as UserWithRoles | null;
    if (!userWithRoles || !userWithRoles.roles) return false;
    return userWithRoles.roles.some(function (r: UserRole) {
      return r.name === role;
    });
  }

  function hasAnyRole(roles: string[]): boolean {
    const userWithRoles = user as UserWithRoles | null;
    if (!userWithRoles || !userWithRoles.roles) return false;
    return userWithRoles.roles.some(function (r: UserRole) {
      return roles.indexOf(r.name) !== -1;
    });
  }

  function hasPermission(permission: string): boolean {
    const userWithRoles = user as UserWithRoles | null;
    if (!userWithRoles || !userWithRoles.roles) return false;
    return userWithRoles.roles.some(function (r: UserRole) {
      if (!r.permissions) return false;
      return r.permissions.some(function (p: Permission) {
        return p.name === permission;
      });
    });
  }

  function hasAnyPermission(permissions: string[]): boolean {
    if (!user) return false;
    return permissions.some(function (p: string) {
      return hasPermission(p);
    });
  }

  const value: SecurityContextValue = {
    user: user,
    isAuthenticated: user !== null,
    hasRole: hasRole,
    hasAnyRole: hasAnyRole,
    hasPermission: hasPermission,
    hasAnyPermission: hasAnyPermission,
    login: login,
    logout: logout,
  };

  return React.createElement(
    SecurityContext.Provider,
    { value: value },
    children
  );
}

export function useSecurity(): SecurityContextValue {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
}

export function useCurrentUser(): User | null {
  const { user } = useSecurity();
  return user;
}

export function useIsAuthenticated(): boolean {
  const { isAuthenticated } = useSecurity();
  return isAuthenticated;
}

interface HasPermissionProps {
  permission?: string;
  role?: string;
  permissions?: string[];
  roles?: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function HasPermission(props: HasPermissionProps): React.ReactElement | null {
  const { permission, role, permissions, roles, children, fallback } = props;
  const { hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useSecurity();

  if (permission && !hasPermission(permission)) {
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  if (role && !hasRole(role)) {
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  if (permissions && permissions.length > 0 && !hasAnyPermission(permissions)) {
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  return React.createElement(React.Fragment, null, children);
}

interface AuthenticatedProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function Authenticated(props: AuthenticatedProps): React.ReactElement | null {
  const { children, fallback } = props;
  const { isAuthenticated } = useSecurity();

  if (!isAuthenticated) {
    return fallback ? React.createElement(React.Fragment, null, fallback) : null;
  }

  return React.createElement(React.Fragment, null, children);
}
