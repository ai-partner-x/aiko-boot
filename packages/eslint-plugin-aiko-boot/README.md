# @aiko-boot/eslint-plugin

ESLint plugin to enforce Java-compatible TypeScript code for aiko-boot Framework.

## Installation

```bash
pnpm add -D @aiko-boot/eslint-plugin @typescript-eslint/parser
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
  plugins: ['@aiko-boot'],
  extends: ['plugin:@aiko-boot/recommended'],
};
```

### Strict Mode

For maximum Java compatibility:

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@aiko-boot'],
  extends: ['plugin:@aiko-boot/strict'],
};
```

### Custom Configuration

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@aiko-boot'],
  rules: {
    '@aiko-boot/no-arrow-methods': 'error',
    '@aiko-boot/no-destructuring-in-methods': 'error',
    '@aiko-boot/no-object-spread': 'warn',
    '@aiko-boot/static-route-paths': 'error',
    '@aiko-boot/require-rest-controller': 'error',
  },
};
```

## Rules

### `@aiko-boot/no-arrow-methods` (error)

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

### `@aiko-boot/no-destructuring-in-methods` (error)

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

### `@aiko-boot/no-object-spread` (warn)

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

### `@aiko-boot/static-route-paths` (error)

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

### `@aiko-boot/require-rest-controller` (error)

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

### `plugin:@aiko-boot/recommended`

Recommended rules for Java compatibility:
- `no-arrow-methods`: error
- `no-destructuring-in-methods`: error
- `no-object-spread`: warn
- `static-route-paths`: error
- `require-rest-controller`: error

### `plugin:@aiko-boot/strict`

Strict mode (all rules as errors):
- `no-arrow-methods`: error
- `no-destructuring-in-methods`: error
- `no-object-spread`: error (upgraded from warn)
- `static-route-paths`: error
- `require-rest-controller`: error

## License

MIT
