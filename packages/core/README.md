# @ai-first/core

Core decorators and metadata system for AI-First Framework.

## Features

- **Component decorators**: `@Component`, `@Service`
- **Method decorators**: `@Transactional`, `@Async`
- **Metadata System**: Built on `reflect-metadata` for runtime introspection

## Installation

```bash
pnpm add @ai-first/core
```

## Usage

### `@Service` / `@Component`

```typescript
import { Service } from '@ai-first/core';

@Service()
export class UserService {
  async findById(id: number) { /* ... */ }
}
```

### `@Transactional`

```typescript
import { Service, Transactional } from '@ai-first/core';

@Service()
export class OrderService {
  @Transactional()
  async placeOrder(dto: PlaceOrderDto) {
    // runs inside a transaction context (logged start/commit/rollback)
  }
}
```

### `@Async` — Background Tasks (Spring Boot `@Async` equivalent)

`@Async` turns a method into a **fire-and-forget** background task.  The caller
receives `void` immediately and the original async logic is scheduled via
`setImmediate`, detached from the caller's execution path.

```typescript
import { Service, Async } from '@ai-first/core';

@Service()
export class NotificationService {
  @Async()
  async sendWelcomeEmail(userId: number): Promise<void> {
    // runs in the background — caller is NOT blocked
    await this.mailer.send(userId);
  }
}
```

**Custom error handler** — uncaught errors inside a background task are sent to
`console.error` by default.  Pass `onError` to override:

```typescript
@Async({ onError: (err, method) => logger.error({ method, err }) })
async heavyReport(): Promise<void> { /* ... */ }
```

**Introspection** — check whether a method is async at runtime:

```typescript
import { isAsync, getAsyncOptions } from '@ai-first/core';

isAsync(NotificationService.prototype, 'sendWelcomeEmail'); // true
getAsyncOptions(NotificationService.prototype, 'sendWelcomeEmail'); // { onError?: ... }
```

> **Important**: `@Async` methods always return `void` from the caller's perspective.
> Do **not** `await` an `@Async` method — the awaited value will always be
> `undefined`.

## License

MIT
