# @ai-partner-x/aiko-boot-starter-security

Aiko Boot Security Starter - Spring Boot style authentication and authorization for AI-First Framework.

## Features

- **Multiple Authentication Strategies**: JWT, OAuth2, Session, Local
- **Role-Based Access Control (RBAC)**: Comprehensive permission system
- **Declarative Security**: Decorator-based security configuration
- **Auto Configuration**: Zero-config startup with sensible defaults
- **Type Safe**: Full TypeScript support
- **Java Compatible**: Decorators can be transpiled to Spring Security annotations

## Installation

```bash
pnpm add @ai-partner-x/aiko-boot-starter-security
```

## Quick Start

```typescript
import { createApp } from '@ai-partner-x/aiko-boot';
import '@ai-partner-x/aiko-boot-starter-security';

const app = await createApp({ srcDir: __dirname });
app.run();
```

## Usage

### Controller with Security Decorators

```typescript
import { RestController, GetMapping, PostMapping } from '@ai-partner-x/aiko-boot-starter-web';
import { Public, PreAuthorize, RolesAllowed } from '@ai-partner-x/aiko-boot-starter-security';

@RestController({ path: '/api/users' })
export class UserController {
  @GetMapping()
  @PreAuthorize("hasRole('ADMIN')")
  async list(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @GetMapping('/public')
  @Public()
  async publicInfo(): Promise<any> {
    return { message: 'Public API' };
  }
}
```

### Configuration

```typescript
import type { AppConfig } from '@ai-partner-x/aiko-boot';

export default {
  security: {
    enabled: true,
    jwt: {
      secret: process.env.JWT_SECRET || 'your-secret-key',
      expiresIn: '24h',
    },
    publicPaths: ['/api/auth/login', '/api/auth/register'],
  },
} satisfies AppConfig;
```

## Decorators

### Authentication

- `@Public()` - Mark endpoint as publicly accessible
- `@Authenticated()` - Require authentication
- `@RolesAllowed(...roles)` - Require specific roles

### Authorization

- `@PreAuthorize(expression)` - Pre-authorization check
- `@PostAuthorize(expression)` - Post-authorization check
- `@Secured(...permissions)` - Require specific permissions

## Permission Expressions

- `hasRole('ROLE_NAME')` - Check if user has role
- `hasPermission('permission:name')` - Check if user has permission
- `hasAnyRole('ROLE1', 'ROLE2')` - Check if user has any of the roles
- `hasAllRoles('ROLE1', 'ROLE2')` - Check if user has all roles
- `authenticated()` - Check if user is authenticated

## React Integration

```typescript
import { SecurityProvider, useSecurity, HasPermission } from '@ai-partner-x/aiko-boot-starter-security/react';

function App() {
  return (
    <SecurityProvider>
      <Dashboard />
    </SecurityProvider>
  );
}

function Dashboard() {
  const { user, isAuthenticated, hasRole } = useSecurity();
  
  if (!isAuthenticated) {
    return <Login />;
  }
  
  return (
    <HasPermission permission="user:read">
      <UserList />
    </HasPermission>
  );
}
```

## License

MIT
