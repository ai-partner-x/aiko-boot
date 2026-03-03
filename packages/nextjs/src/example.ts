/**
 * Complete Example: Spring Boot Style API in Next.js
 */

import { Entity, Field, DbField, Validation, Repository, Service } from '@ai-first/core';
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestParam,
  RequestBody,
  createRouteHandler,
} from './index.js';

// ==================== 1. Entity Definition ====================

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

// ==================== 2. DTO Definitions ====================

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

class UserQueryDto {
  keyword?: string;
  minAge?: number;
  maxAge?: number;
  pageNo?: number;
  pageSize?: number;
}

// ==================== 3. Repository Layer ====================

@Repository()
class UserRepository {
  async findById(id: number): Promise<User | null> {
    // Mock implementation
    console.log(`Finding user by id: ${id}`);
    return { id, username: 'john', email: 'john@example.com' } as User;
  }

  async findAll(query: UserQueryDto): Promise<User[]> {
    // Mock implementation
    console.log('Finding users with query:', query);
    return [];
  }

  async save(user: User): Promise<User> {
    // Mock implementation
    console.log('Saving user:', user);
    return user;
  }

  async deleteById(id: number): Promise<boolean> {
    // Mock implementation
    console.log(`Deleting user: ${id}`);
    return true;
  }
}

// ==================== 4. Service Layer ====================

@Service()
class UserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async searchUsers(query: UserQueryDto): Promise<User[]> {
    return this.userRepository.findAll(query);
  }

  async createUser(dto: CreateUserDto): Promise<User> {
    const user = { ...dto, id: Date.now() } as User;
    return this.userRepository.save(user);
  }

  async updateUser(id: number, dto: UpdateUserDto): Promise<User | null> {
    const user = await this.userRepository.findById(id);
    if (!user) return null;
    
    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.userRepository.deleteById(id);
  }
}

// ==================== 5. Controller Layer (Spring Boot Style!) ====================

/**
 * UserController - Just like Spring Boot!
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
 * }
 * ```
 */
@RestController({ path: '/api/users' })
export class UserController {
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
   * GET /api/users?keyword=xxx&minAge=18&maxAge=65
   * Search users with query parameters
   */
  @GetMapping()
  async searchUsers(
    @RequestParam('keyword') keyword?: string,
    @RequestParam('minAge') minAge?: number,
    @RequestParam('maxAge') maxAge?: number,
    @RequestParam('pageNo') pageNo: number = 1,
    @RequestParam('pageSize') pageSize: number = 20
  ) {
    return this.userService.searchUsers({
      keyword,
      minAge,
      maxAge,
      pageNo,
      pageSize,
    });
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
  async updateUser(@PathVariable('id') id: number, @RequestBody() dto: UpdateUserDto) {
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
 * export const GET = createRouteHandler(UserController, 'searchUsers');
 * export const POST = createRouteHandler(UserController, 'createUser');
 * ```
 */
