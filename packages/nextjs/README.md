# @ai-first/nextjs

Spring Boot Starter Web 风格的 TypeScript MVC 装饰器系统，基于 Express.js 运行。

框架的核心目标是让 TypeScript 代码尽可能与 Java Spring Boot Starter Web 的 API 风格保持一致，以便：

1. **AI 可理解**：AI 能基于对 Java Spring Boot Starter Web 的理解来生成/优化 TypeScript 代码
2. **代码可转换**：TypeScript 代码可以被代码生成工具转换为等价的 Java Spring Boot Starter Web 代码

## 安装

```bash
pnpm add @ai-first/nextjs
```

## ✅ 已实现的功能

### 类装饰器（Class Decorators）

| TypeScript 装饰器 | 对应 Java Spring 注解 | 说明 |
|---|---|---|
| `@RestController(options?)` | `@RestController` + `@RequestMapping` | 标记 REST 控制器，自动注册到 DI 容器，支持 `path` 前缀 |

### 方法装饰器（Method Decorators）

| TypeScript 装饰器 | 对应 Java Spring 注解 | 说明 |
|---|---|---|
| `@RequestMapping(options)` | `@RequestMapping` | 通用请求映射，支持 `path`、`method`、`description` |
| `@GetMapping(path?)` | `@GetMapping` | 映射 HTTP GET 请求 |
| `@PostMapping(path?)` | `@PostMapping` | 映射 HTTP POST 请求 |
| `@PutMapping(path?)` | `@PutMapping` | 映射 HTTP PUT 请求 |
| `@DeleteMapping(path?)` | `@DeleteMapping` | 映射 HTTP DELETE 请求 |
| `@PatchMapping(path?)` | `@PatchMapping` | 映射 HTTP PATCH 请求 |

### 参数装饰器（Parameter Decorators）

| TypeScript 装饰器 | 对应 Java Spring 注解 | 说明 |
|---|---|---|
| `@PathVariable(name?)` | `@PathVariable` | 提取 URL 路径变量 |
| `@RequestParam(name?, required?)` | `@RequestParam` | 提取 URL 查询参数 |
| `@QueryParam(name?, required?)` | `@RequestParam` | `@RequestParam` 的别名 |
| `@RequestBody()` | `@RequestBody` | 提取请求体（JSON） |
| `@RequestPart(name?)` | `@RequestPart` | 提取 `multipart/form-data` 中的文件字段，自动注入 `MultipartFile` 对象 |
| `@ModelAttribute(name?)` | `@ModelAttribute` | 将 URL 查询参数与表单字段合并为一个对象注入（适合搜索 DTO、form 表单绑定） |
| `@RequestAttribute(name)` | `@RequestAttribute` | 从 Express `req` 对象上读取由上游中间件设置的自定义属性（如 `req.currentUser`） |

### 文件上传（File Upload）

| TypeScript API | 对应 Java Spring 类型 | 说明 |
|---|---|---|
| `MultipartFile` 接口 | `org.springframework.web.multipart.MultipartFile` | 上传文件的抽象，提供 `getName()`、`getOriginalFilename()`、`getContentType()`、`getSize()`、`getBytes()`、`isEmpty()`、`transferTo(dest)` |

使用 `@RequestPart` 的方法路由会自动挂载 multer 内存存储中间件，无需额外配置。

### 客户端（Feign Client 风格）

| 功能 | 对应 Java 概念 | 说明 |
|---|---|---|
| `@ApiContract(options?)` | `@FeignClient` 接口定义 | 定义 API 契约（无 DI 注册，前后端共享） |
| `createApiClient(ApiClass, options)` | Feign 动态代理 | 基于装饰器元数据生成类型安全的 HTTP 客户端 |
| `createApiClientFromMeta(meta, ApiClass, options)` | Feign 代理（静态元数据） | 基于静态元数据生成客户端，无需 `reflect-metadata`（SSR 安全） |

### 框架基础设施

| 功能 | 对应 Java 概念 | 说明 |
|---|---|---|
| `createExpressRouter(controllers, options?)` | `DispatcherServlet` | 自动将 `@RestController` 注册为 Express 路由 |
| `createApp(options)` | `SpringApplication.run()` | Spring Boot 风格的应用引导，自动扫描并注册组件 |

### 与其他包的集成

| 功能包 | 对应 Java 概念 | 说明 |
|---|---|---|
| `@ai-first/di`：`@Autowired`、`@Injectable` | `@Autowired`、`@Component` | 构造器注入 + 属性注入，由 DI 容器管理 |
| `@ai-first/core`：`@Service`、`@Component` | `@Service`、`@Component` | 业务层/通用组件标注 |
| `@ai-first/orm`：`@Mapper`、`BaseMapper<T>` | MyBatis-Plus Mapper | 数据访问层，`createApp` 自动扫描 `mapper/` 目录 |

### 快速使用示例

```typescript
import { RestController, GetMapping, PostMapping, PathVariable, RequestBody } from '@ai-first/nextjs';
import { Service, Autowired } from '@ai-first/core';
import { UserService } from '../service/user.service.js';

@RestController({ path: '/users' })
export class UserController {
  @Autowired()
  private userService!: UserService;

  @GetMapping()
  async list() {
    return this.userService.findAll();
  }

  @GetMapping('/:id')
  async getById(@PathVariable('id') id: string) {
    return this.userService.findById(Number(id));
  }

  @PostMapping()
  async create(@RequestBody() body: CreateUserDto) {
    return this.userService.create(body);
  }
}
```

```typescript
// 启动应用（Spring Boot 风格）
import { createApp } from '@ai-first/nextjs';

const app = await createApp({
  srcDir: import.meta.dirname,
  prefix: '/api',
  database: { type: 'sqlite', filename: ':memory:' },
});
app.listen(3001, () => console.log('Server running on port 3001'));
```

```typescript
// 文件上传示例（Spring Boot @RequestPart 风格）
import { RestController, PostMapping, RequestPart, type MultipartFile } from '@ai-first/nextjs';

@RestController({ path: '/files' })
export class FileController {
  @PostMapping('/upload')
  async upload(@RequestPart('file') file: MultipartFile) {
    // 获取文件元数据
    console.log('原始文件名:', file.getOriginalFilename()); // e.g. "photo.jpg"
    console.log('Content-Type:', file.getContentType());    // e.g. "image/jpeg"
    console.log('文件大小:', file.getSize());               // bytes

    // 获取文件内容（Buffer）
    const bytes = file.getBytes();

    // 保存到磁盘
    await file.transferTo('/uploads/' + file.getOriginalFilename());

    return { filename: file.getOriginalFilename(), size: file.getSize() };
  }
}
```

```typescript
// 表单绑定示例（Spring Boot @ModelAttribute 风格）
import { RestController, GetMapping, PostMapping, ModelAttribute } from '@ai-first/nextjs';

interface SearchDto { keyword: string; page: string; size: string; }
interface RegisterDto { username: string; email: string; }

@RestController({ path: '/users' })
export class UserController {
  // GET /api/users/search?keyword=hello&page=1&size=10
  // query params → SearchDto
  @GetMapping('/search')
  async search(@ModelAttribute() query: SearchDto) {
    return this.userService.search(query);
  }

  // POST /api/users/register  (application/x-www-form-urlencoded)
  // form fields → RegisterDto
  @PostMapping('/register')
  async register(@ModelAttribute('user') dto: RegisterDto) {
    return this.userService.register(dto);
  }
}
```

```typescript
// 请求属性注入示例（Spring Boot @RequestAttribute 风格）
import { RestController, GetMapping, RequestAttribute } from '@ai-first/nextjs';

// 1. 在 Express 中间件中设置 req.currentUser
// app.use((req, res, next) => {
//   (req as any).currentUser = jwtDecode(req.headers.authorization);
//   next();
// });

@RestController({ path: '/profile' })
export class ProfileController {
  @GetMapping()
  async me(@RequestAttribute('currentUser') user: { id: number; name: string }) {
    return user;  // 直接返回中间件注入的用户对象
  }
}
```

---

## ❌ 待完善的功能

以下是 Spring Boot Starter Web 中已有、但本模块尚未实现的功能，按优先级排列。

---

### 一、方法装饰器（Method Decorators）

#### 1. `@ResponseStatus` ⭐⭐⭐
**对应 Java**：`@ResponseStatus(HttpStatus.CREATED)`

设置处理方法的 HTTP 响应状态码。目前所有成功响应均固定返回 200，异常固定返回 400。

```typescript
// 期望实现
@PostMapping()
@ResponseStatus(HttpStatus.CREATED)  // 返回 201
async create(@RequestBody() body: CreateUserDto) { ... }

@DeleteMapping('/:id')
@ResponseStatus(HttpStatus.NO_CONTENT)  // 返回 204
async delete(@PathVariable('id') id: string) { ... }
```

#### 2. `@ExceptionHandler` ⭐⭐⭐
**对应 Java**：`@ExceptionHandler(NotFoundException.class)`

在 `@RestController` 或 `@RestControllerAdvice` 类中标记异常处理方法，将特定异常映射到 HTTP 响应。

```typescript
// 期望实现
@RestController({ path: '/users' })
export class UserController {
  @ExceptionHandler(NotFoundException)
  handleNotFound(ex: NotFoundException) {
    return { message: ex.message };  // 自动返回 404
  }
}
```

#### 3. `@CrossOrigin` ⭐⭐
**对应 Java**：`@CrossOrigin(origins = "http://localhost:3000")`

在 Controller 类或方法上配置细粒度的 CORS 策略。目前 `createApp` 只支持全局 CORS 开关。

```typescript
// 期望实现
@CrossOrigin({ origins: ['http://localhost:3000'] })
@RestController({ path: '/users' })
export class UserController { ... }
```

#### 4. `@InitBinder` ⭐
**对应 Java**：`@InitBinder`

在 Controller 内自定义 WebDataBinder，用于类型转换和格式化。适合日期格式、自定义类型绑定等场景。

---

### 二、类装饰器（Class Decorators）

#### 5. `@Controller` ⭐⭐
**对应 Java**：`@Controller`

与 `@RestController` 的区别：`@Controller` 方法默认返回视图名（模板渲染），而不是 JSON 响应体。目前框架只有 `@RestController`。

```typescript
// 期望实现（用于 SSR 场景）
@Controller({ path: '/pages' })
export class PageController {
  @GetMapping('/home')
  home() {
    return 'home';  // 返回视图名，而非 JSON
  }
}
```

#### 6. `@RestControllerAdvice` / `@ControllerAdvice` ⭐⭐⭐
**对应 Java**：`@RestControllerAdvice`

全局异常处理类，集中处理所有 Controller 抛出的异常。等价于 Spring 的 `@ControllerAdvice` + `@ResponseBody`。

```typescript
// 期望实现
@RestControllerAdvice()
export class GlobalExceptionHandler {
  @ExceptionHandler(NotFoundException)
  handleNotFound(ex: NotFoundException) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND).body({ message: ex.message });
  }

  @ExceptionHandler(ValidationException)
  handleValidation(ex: ValidationException) {
    return ResponseEntity.badRequest().body({ errors: ex.errors });
  }
}
```

---

### 三、参数装饰器（Parameter Decorators）

#### 7. `@RequestHeader` ⭐⭐⭐
**对应 Java**：`@RequestHeader("Authorization")`

从 HTTP 请求头中提取指定字段。常用于鉴权（Token）、内容协商等场景。

```typescript
// 期望实现
@GetMapping('/profile')
async getProfile(@RequestHeader('Authorization') token: string) {
  return this.authService.decode(token);
}
```

#### 8. `@CookieValue` ⭐⭐
**对应 Java**：`@CookieValue("sessionId")`

从 HTTP Cookie 中提取指定字段。

```typescript
// 期望实现
@GetMapping('/me')
async me(@CookieValue('sessionId') sessionId: string) {
  return this.sessionService.get(sessionId);
}
```

#### 9. `@RequestPart` ⭐⭐ ✅ 已实现
**对应 Java**：`@RequestPart("file") MultipartFile file`

处理 `multipart/form-data` 上传请求，提取文件字段，自动注入 `MultipartFile` 对象。详见"已实现的功能"章节。

#### 10. `@ModelAttribute` ⭐⭐ ✅ 已实现
**对应 Java**：`@ModelAttribute`

作为参数装饰器时，将 URL 查询参数与表单 body 字段合并为一个对象注入。详见"已实现的功能"章节。

#### 11. `@RequestAttribute` ⭐ ✅ 已实现
**对应 Java**：`@RequestAttribute("userId")`

提取由上游 Express 中间件预先挂载在 `req` 对象上的自定义属性。详见"已实现的功能"章节。

#### 12. `@SessionAttribute` ⭐
**对应 Java**：`@SessionAttribute("cart")`

从 HTTP Session 中提取指定属性。

---

### 四、请求验证（Validation Integration）

#### 13. `@Valid` / `@Validated` ⭐⭐⭐
**对应 Java**：`@Valid` / `@Validated`

与 `@ai-first/validation`（class-validator）集成，在进入控制器方法前自动校验 `@RequestBody` 参数，校验失败时自动返回 422/400 响应。

```typescript
// 期望实现
import { IsNotEmpty, IsEmail, Length } from '@ai-first/validation';

class CreateUserDto {
  @IsNotEmpty()
  @Length(2, 50)
  name: string;

  @IsEmail()
  email: string;
}

@PostMapping()
async create(@Valid() @RequestBody() body: CreateUserDto) {
  // body 已通过校验，否则自动返回 400 + 错误详情
  return this.userService.create(body);
}
```

---

### 五、响应抽象（Response Abstractions）

#### 14. `ResponseEntity<T>` ⭐⭐⭐
**对应 Java**：`ResponseEntity<T>`

允许方法返回携带自定义状态码、响应头和响应体的包装对象，实现对 HTTP 响应的完整控制。

```typescript
// 期望实现
@GetMapping('/:id')
async getById(@PathVariable('id') id: string): Promise<ResponseEntity<User>> {
  const user = await this.userService.findById(Number(id));
  if (!user) {
    return ResponseEntity.notFound().build();
  }
  return ResponseEntity.ok(user);
}
```

#### 15. `HttpStatus` 枚举 ⭐⭐⭐
**对应 Java**：`org.springframework.http.HttpStatus`

完整的 HTTP 状态码枚举，配合 `@ResponseStatus` 和 `ResponseEntity` 使用。

```typescript
// 期望实现
import { HttpStatus } from '@ai-first/nextjs';

HttpStatus.OK           // 200
HttpStatus.CREATED      // 201
HttpStatus.NO_CONTENT   // 204
HttpStatus.BAD_REQUEST  // 400
HttpStatus.UNAUTHORIZED // 401
HttpStatus.FORBIDDEN    // 403
HttpStatus.NOT_FOUND    // 404
```

---

### 六、拦截器与过滤器（Interceptors & Filters）

#### 16. `HandlerInterceptor` 接口 ⭐⭐⭐
**对应 Java**：`HandlerInterceptor`

请求预处理/后处理接口，可实现登录鉴权、日志、性能监控等横切逻辑。

```typescript
// 期望实现
@Component()
export class AuthInterceptor implements HandlerInterceptor {
  preHandle(req: Request, res: Response): boolean {
    if (!req.headers.authorization) {
      res.status(401).json({ error: 'Unauthorized' });
      return false;
    }
    return true;
  }
}
```

#### 17. `WebMvcConfigurer` 接口 ⭐⭐
**对应 Java**：`WebMvcConfigurer`

框架级配置接口，用于注册拦截器、全局跨域规则、消息转换器等。

```typescript
// 期望实现
@Component()
export class MvcConfig implements WebMvcConfigurer {
  addInterceptors(registry: InterceptorRegistry) {
    registry.addInterceptor(new AuthInterceptor()).addPathPatterns('/api/**');
  }

  addCorsMappings(registry: CorsRegistry) {
    registry.addMapping('/api/**').allowedOrigins('http://localhost:3000');
  }
}
```

#### 18. `Filter` / `OncePerRequestFilter` ⭐⭐
**对应 Java**：`javax.servlet.Filter` / `OncePerRequestFilter`

Servlet 过滤器，在请求到达 DispatcherServlet 之前执行，适用于请求日志、请求体解析、IP 过滤等场景。

---

### 七、分页支持（Pagination）

#### 19. `Pageable` / `PageRequest` / `Page<T>` ⭐⭐⭐
**对应 Java**：`org.springframework.data.domain.Pageable`

Spring Data 风格的分页支持，配合 `@RequestParam` 自动将 `page`、`size`、`sort` 参数注入为 `Pageable` 对象。

```typescript
// 期望实现
@GetMapping()
async list(@RequestParam('page') page = 0, @RequestParam('size') size = 10): Promise<Page<User>> {
  const pageable = PageRequest.of(page, size, Sort.by('createdAt').descending());
  return this.userService.findAll(pageable);
}

// 或更 Spring 风格的参数注入：
@GetMapping()
async list(@PageableDefault({ size: 10 }) pageable: Pageable): Promise<Page<User>> {
  return this.userService.findAll(pageable);
}
```

---

### 八、内容协商（Content Negotiation）

#### 20. `produces` / `consumes` 选项 ⭐⭐
**对应 Java**：`@GetMapping(produces = "application/json")`

在映射注解中声明请求/响应的 MediaType，用于内容协商和接口文档生成。

```typescript
// 期望实现
@PostMapping({ path: '/upload', consumes: 'multipart/form-data' })
async upload(@RequestPart('file') file: File) { ... }

@GetMapping({ path: '/export', produces: 'application/octet-stream' })
async export() { ... }
```

---

### 九、异步与响应式支持（Async / Reactive）

#### 21. `@Async` 支持 ⭐
**对应 Java**：`@Async`

标记方法为异步执行（在独立线程池中执行），返回 `CompletableFuture` 等价类型。Node.js 本身是异步的，可按场景实现为后台任务/队列。

---

### 十、安全集成（Spring Security 兼容，可选）

#### 22. `@PreAuthorize` / `@PostAuthorize` ⭐⭐
**对应 Java**：`@PreAuthorize("hasRole('ADMIN')")`

方法级权限控制装饰器，配合认证中间件使用。

```typescript
// 期望实现
@GetMapping('/admin/users')
@PreAuthorize("hasRole('ADMIN')")
async listAllUsers() { ... }
```

#### 23. `Authentication` 参数注入 ⭐⭐
**对应 Java**：`Authentication authentication` 参数

通过专门的参数装饰器（如 `@CurrentUser()`）注入当前认证用户信息，由框架从请求上下文中自动解析。

```typescript
// 期望实现
@GetMapping('/profile')
async profile(@CurrentUser() user: UserDetails) {
  return user;
}
```

---

### 十一、其他缺失功能

#### 24. `@MatrixVariable` ⭐
**对应 Java**：`@MatrixVariable`

提取 URL 路径段中的矩阵变量（如 `/users/1;role=admin`）。

#### 25. `HttpServletRequest` / `HttpServletResponse` 直接注入 ⭐
**对应 Java**：方法参数直接声明 `HttpServletRequest req`

允许处理方法直接获取原始 Express `Request` / `Response` 对象（通过专门的参数装饰器如 `@Req()` / `@Res()`）。

```typescript
// 期望实现
@GetMapping('/stream')
async stream(@Req() req: Request, @Res() res: Response) {
  res.setHeader('Content-Type', 'text/event-stream');
  // ...
}
```

#### 26. 静态资源服务 ⭐
**对应 Java**：`WebMvcConfigurer.addResourceHandlers()`

在 `createApp` 中支持静态资源目录配置（等价于 Spring Boot 的 `spring.resources.static-locations`）。

---

## 📋 功能完成度总览

| 类别 | 已实现 | 待完善 |
|---|---|---|
| 类装饰器 | `@RestController` | `@Controller`、`@RestControllerAdvice`、`@ControllerAdvice` |
| 方法映射装饰器 | `@RequestMapping`、`@GetMapping`、`@PostMapping`、`@PutMapping`、`@DeleteMapping`、`@PatchMapping` | `produces`/`consumes` 选项 |
| 方法装饰器 | — | `@ResponseStatus`、`@ExceptionHandler`、`@CrossOrigin`、`@InitBinder` |
| 参数装饰器 | `@PathVariable`、`@RequestParam`、`@RequestBody`、`@RequestPart`、`@ModelAttribute`、`@RequestAttribute` | `@RequestHeader`、`@CookieValue`、`@SessionAttribute`、`@MatrixVariable`、`@Req`/`@Res` |
| 请求验证 | — | `@Valid`/`@Validated` + `@ai-first/validation` 集成 |
| 响应抽象 | — | `ResponseEntity<T>`、`HttpStatus` 枚举 |
| 拦截器/过滤器 | — | `HandlerInterceptor`、`WebMvcConfigurer`、`Filter` |
| 分页 | — | `Pageable`、`PageRequest`、`Page<T>` |
| 安全（可选） | — | `@PreAuthorize`、`@CurrentUser` |
| 文件上传 | `MultipartFile`、`@RequestPart`（multer 内存存储，自动挂载） | 多文件字段批量上传、磁盘存储配置 |
| 异步 | 原生 `async/await`、`@Async`（`@ai-first/core`，fire-and-forget 后台任务） | — |
| 框架引导 | `createApp`（扫描 controller/service/mapper） | 拦截器注册、静态资源、全局异常处理器 |

---

## 相关包

- [`@ai-first/di`](../di) - 依赖注入容器（`@Autowired`、`@Injectable`）
- [`@ai-first/core`](../core) - 核心业务层装饰器（`@Service`、`@Component`、`@Transactional`）
- [`@ai-first/orm`](../orm) - 数据访问层（`@Mapper`、`BaseMapper<T>`、`QueryWrapper`）
- [`@ai-first/validation`](../validation) - 数据验证（`@IsNotEmpty`、`@IsEmail` 等 class-validator 封装）

## License

MIT
