# @ai-first/eslint-plugin

ESLint plugin to enforce Java-compatible TypeScript code for AI-First Framework.

## Installation

```bash
pnpm add -D @ai-first/eslint-plugin @typescript-eslint/parser
```

## Usage

### Basic Setup

In your `.eslintrc.js` or `.eslintrc.json`:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  plugins: ['@ai-first'],
  extends: ['plugin:@ai-first/recommended'],
};
```

### Strict Mode

For maximum Java compatibility:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@ai-first'],
  extends: ['plugin:@ai-first/strict'],
};
```

### Custom Configuration

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@ai-first'],
  rules: {
    '@ai-first/no-arrow-methods': 'error',
    '@ai-first/no-destructuring-in-methods': 'error',
    '@ai-first/no-object-spread': 'warn',
    '@ai-first/static-route-paths': 'error',
    '@ai-first/require-rest-controller': 'error',
  },
};
```

## Rules

### `@ai-first/no-arrow-methods` (error)

Disallow arrow functions as class methods (not Java-compatible).

❌ **Incorrect**:
```typescript
@RestController()
class UserController {
  // ❌ Arrow function as method
  getUser = async (id: number) => {
    return this.userService.getUserById(id);
  }
}
```

✅ **Correct**:
```typescript
@RestController()
class UserController {
  // ✅ Regular method
  async getUser(id: number) {
    return this.userService.getUserById(id);
  }
}
```

### `@ai-first/no-destructuring-in-methods` (error)

Disallow destructuring in class methods (not Java-compatible).

❌ **Incorrect**:
```typescript
async createUser(dto: CreateUserDto) {
  // ❌ Destructuring
  const { username, email } = dto;
  return this.userService.create(username, email);
}
```

✅ **Correct**:
```typescript
async createUser(dto: CreateUserDto) {
  // ✅ Explicit property access
  const username = dto.username;
  const email = dto.email;
  return this.userService.create(username, email);
}
```

### `@ai-first/no-object-spread` (warn)

Warn about object spread in class methods (difficult to translate to Java).

❌ **Problematic**:
```typescript
async updateUser(id: number, dto: UpdateUserDto) {
  // ⚠️ Object spread
  const user = { ...dto, id };
  return this.userRepository.save(user);
}
```

✅ **Recommended**:
```typescript
async updateUser(id: number, dto: UpdateUserDto) {
  // ✅ Explicit assignment (translates to BeanUtils.copyProperties in Java)
  const user = new User();
  user.id = id;
  user.username = dto.username;
  user.email = dto.email;
  return this.userRepository.save(user);
}
```

### `@ai-first/static-route-paths` (error)

Enforce static string literals for route paths.

❌ **Incorrect**:
```typescript
const BASE_PATH = '/api/users';

@RestController({ path: BASE_PATH })  // ❌ Dynamic path
class UserController {}
```

✅ **Correct**:
```typescript
@RestController({ path: '/api/users' })  // ✅ Static string literal
class UserController {}
```

### `@ai-first/require-rest-controller` (error)

Require `@RestController` decorator for classes with route mapping decorators.

❌ **Incorrect**:
```typescript
// ❌ Missing @RestController
class UserController {
  @GetMapping('/:id')
  async getUser(id: number) {}
}
```

✅ **Correct**:
```typescript
@RestController({ path: '/api/users' })  // ✅ Has @RestController
class UserController {
  @GetMapping('/:id')
  async getUser(id: number) {}
}
```

## Configuration Presets

### `plugin:@ai-first/recommended`

Recommended rules for Java compatibility:
- `no-arrow-methods`: error
- `no-destructuring-in-methods`: error
- `no-object-spread`: warn
- `static-route-paths`: error
- `require-rest-controller`: error

### `plugin:@ai-first/strict`

Strict mode (all rules as errors):
- `no-arrow-methods`: error
- `no-destructuring-in-methods`: error
- `no-object-spread`: error (upgraded from warn)
- `static-route-paths`: error
- `require-rest-controller`: error

## License

MIT
