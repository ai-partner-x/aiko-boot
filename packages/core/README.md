# @ai-first/core

Core decorators and metadata system for AI-First Framework.

## Features

- **Entity Layer Decorators**: `@Entity`, `@Field`, `@DbField`, `@Validation`
- **Service Layer Decorators**: `@Repository`, `@Service`, `@AppService`
- **Method Decorators**: `@Action`, `@Expose`, `@Transactional`
- **Metadata System**: Built on `reflect-metadata` for runtime introspection

## Installation

```bash
pnpm add @ai-first/core
```

## Usage

### Define Entity

```typescript
import { Entity, Field, DbField, Validation } from '@ai-first/core';

@Entity({ table: 'users', comment: 'User table' })
export class User {
  @Field({ label: 'ID' })
  @DbField({ primaryKey: true, type: 'BIGINT' })
  id: number;

  @Field({ label: 'Username' })
  @DbField({ type: 'VARCHAR', length: 50, unique: true })
  @Validation({ required: true, min: 3, max: 50 })
  username: string;

  @Field({ label: 'Email' })
  @Validation({ required: true, email: true })
  email: string;
}
```

### Define Service

```typescript
import { Service, AppService, Action, Expose } from '@ai-first/core';

@Service()
export class UserService {
  async findById(id: number) {
    // Implementation
  }
}

@AppService({ expose: true })
export class UserAppService {
  constructor(private userService: UserService) {}

  @Action({ transaction: true })
  @Expose({ method: 'POST', path: '/api/user/create' })
  async createUser(data: CreateUserDto) {
    return this.userService.create(data);
  }
}
```

## License

MIT
