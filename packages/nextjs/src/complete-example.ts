/**
 * Complete Example: Spring Boot Style (Cleaned Up)
 * Shows the correct usage after cleanup
 */

// ==================== Domain Layer (@ai-first/core) ====================
import { Entity, Field, DbField, Validation, Repository, Service, Transactional } from '@ai-first/core';

// ==================== Web Layer (@ai-first/nextjs) ====================
import { 
  RestController, 
  GetMapping, 
  PostMapping, 
  PutMapping, 
  DeleteMapping,
  PathVariable, 
  RequestParam,
  RequestBody,
  createRouteHandler 
} from '@ai-first/nextjs';

// ==================== 1. Entity (Domain Model) ====================

@Entity({ table: 'users', comment: 'User table' })
class User {
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

  @Field({ label: 'Age' })
  @Validation({ min: 0, max: 150 })
  age?: number;
}

// ==================== 2. DTO ====================

class CreateUserDto {
  @Validation({ required: true, min: 3, max: 50 })
  username: string;

  @Validation({ required: true, email: true })
  email: string;

  @Validation({ min: 0, max: 150 })
  age?: number;
}

class UpdateUserDto {
  @Validation({ email: true })
  email?: string;

  @Validation({ min: 0, max: 150 })
  age?: number;
}

// ==================== 3. Repository Layer ====================

@Repository()
class UserRepository {
  async findById(id: number): Promise<User | null> {
    // Database operation
    console.log('[Repository] Finding user:', id);
    return { id, username: 'john', email: 'john@example.com' } as User;
  }

  async findAll(): Promise<User[]> {
    console.log('[Repository] Finding all users');
    return [];
  }

  async save(user: User): Promise<User> {
    console.log('[Repository] Saving user:', user);
    return user;
  }

  async deleteById(id: number): Promise<boolean> {
    console.log('[Repository] Deleting user:', id);
    return true;
  }
}

// ==================== 4. Service Layer ====================

@Service()
class UserService {
  // ✅ Auto DI injection
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  @Transactional()
  async createUser(dto: CreateUserDto): Promise<User> {
    const user = { ...dto, id: Date.now() } as User;
    return this.userRepository.save(user);
  }

  @Transactional()
  async updateUser(id: number, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  @Transactional()
  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.deleteById(id);
  }
}

// ==================== 5. Controller Layer (Web API) ====================

/**
 * UserController - Spring Boot Style!
 * 
 * Equivalent Java code:
 * ```java
 * @RestController
 * @RequestMapping("/api/users")
 * public class UserController {
 *     @Autowired
 *     private UserService userService;
 *     
 *     @GetMapping("/{id}")
 *     public User getUser(@PathVariable Long id) { ... }
 *     
 *     @PostMapping
 *     public User createUser(@RequestBody CreateUserDto dto) { ... }
 * }
 * ```
 */
@RestController({ path: '/api/users' })
export class UserController {
  // ✅ Auto DI injection
  constructor(private userService: UserService) {}

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  @GetMapping('/:id')
  async getUser(@PathVariable('id') id: number) {
    const user = await this.userService.getUserById(id);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * GET /api/users
   * Get all users
   */
  @GetMapping()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  /**
   * POST /api/users
   * Create new user
   */
  @PostMapping()
  async createUser(@RequestBody() dto: CreateUserDto) {
    return this.userService.createUser(dto);
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  @PutMapping('/:id')
  async updateUser(
    @PathVariable('id') id: number,
    @RequestBody() dto: UpdateUserDto
  ) {
    const user = await this.userService.updateUser(id, dto);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  /**
   * DELETE /api/users/:id
   * Delete user
   */
  @DeleteMapping('/:id')
  async deleteUser(@PathVariable('id') id: number) {
    const success = await this.userService.deleteUser(id);
    return { success };
  }
}

// ==================== 6. Next.js Route Registration ====================

/**
 * In Next.js App Router: app/api/users/[id]/route.ts
 * 
 * ```typescript
 * import { UserController } from '@/controllers/user.controller';
 * import { createRouteHandler } from '@ai-first/nextjs';
 * 
 * export const GET = createRouteHandler(UserController, 'getUser');
 * export const PUT = createRouteHandler(UserController, 'updateUser');
 * export const DELETE = createRouteHandler(UserController, 'deleteUser');
 * ```
 */

/**
 * In Next.js App Router: app/api/users/route.ts
 * 
 * ```typescript
 * import { UserController } from '@/controllers/user.controller';
 * import { createRouteHandler } from '@ai-first/nextjs';
 * 
 * export const GET = createRouteHandler(UserController, 'getAllUsers');
 * export const POST = createRouteHandler(UserController, 'createUser');
 * ```
 */

// ==================== Summary ====================

/**
 * ✅ Clean Architecture (DDD + MVC):
 * 
 * 1. Entity Layer (@ai-first/core)
 *    - @Entity, @Field, @DbField, @Validation
 * 
 * 2. Repository Layer (@ai-first/core)
 *    - @Repository
 * 
 * 3. Service Layer (@ai-first/core)
 *    - @Service
 *    - @Transactional
 * 
 * 4. Controller Layer (@ai-first/nextjs)
 *    - @RestController
 *    - @GetMapping, @PostMapping, @PutMapping, @DeleteMapping
 *    - @PathVariable, @RequestParam, @RequestBody
 * 
 * ✅ All decorators auto-register to DI container
 * ✅ All constructor parameters auto-inject
 * ✅ 100% aligned with Spring Boot style
 */
