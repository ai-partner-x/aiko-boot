/**
 * Complete DI Test Example
 * Demonstrates automatic dependency injection
 */

import { Repository, Service } from '@ai-first/core';
import { RestController, GetMapping, PostMapping, PathVariable, RequestBody } from './index.js';
import { Container } from '@ai-first/di';

// ==================== Step 1: Define Repository ====================

@Repository()
class UserRepository {
  async findById(id: number) {
    console.log('[UserRepository] Finding user:', id);
    return { id, username: 'john', email: 'john@example.com' };
  }

  async save(user: any) {
    console.log('[UserRepository] Saving user:', user);
    return user;
  }
}

// ==================== Step 2: Define Service ====================

@Service()
class UserService {
  // ✅ Constructor injection - automatically handled!
  constructor(private userRepository: UserRepository) {
    console.log('[UserService] Created with UserRepository injected');
  }

  async getUser(id: number) {
    console.log('[UserService] Getting user:', id);
    return this.userRepository.findById(id);
  }

  async createUser(data: any) {
    console.log('[UserService] Creating user:', data);
    return this.userRepository.save({ ...data, id: Date.now() });
  }
}

// ==================== Step 3: Define Controller ====================

@RestController({ path: '/api/users' })
export class UserController {
  // ✅ Constructor injection - automatically handled!
  constructor(private userService: UserService) {
    console.log('[UserController] Created with UserService injected');
  }

  @GetMapping('/:id')
  async getUser(@PathVariable('id') id: number) {
    console.log('[UserController] GET /api/users/:id', id);
    return this.userService.getUser(id);
  }

  @PostMapping()
  async createUser(@RequestBody() data: any) {
    console.log('[UserController] POST /api/users', data);
    return this.userService.createUser(data);
  }
}

// ==================== Step 4: Test Dependency Injection ====================

/**
 * Test function to verify DI works
 */
export function testDependencyInjection() {
  console.log('\n========== Testing Dependency Injection ==========\n');

  try {
    // Resolve UserController from container
    // It should automatically inject UserService and UserRepository
    const controller = Container.resolve(UserController);
    
    console.log('✅ UserController resolved successfully!');
    console.log('✅ Dependencies automatically injected!');
    
    // Test the methods
    controller.getUser(123).then(user => {
      console.log('\n✅ Test Result:', user);
    });

    return true;
  } catch (error) {
    console.error('❌ DI Test Failed:', error);
    return false;
  }
}

/**
 * Comparison with Spring Boot:
 * 
 * Java (Spring Boot):
 * ```java
 * @RestController
 * @RequestMapping("/api/users")
 * public class UserController {
 *     @Autowired
 *     private UserService userService;  // Auto-injected by Spring
 *     
 *     @GetMapping("/{id}")
 *     public User getUser(@PathVariable Long id) {
 *         return userService.getUser(id);
 *     }
 * }
 * ```
 * 
 * TypeScript (AI-First Framework):
 * ```typescript
 * @RestController({ path: '/api/users' })
 * export class UserController {
 *     constructor(private userService: UserService) {}  // Auto-injected!
 *     
 *     @GetMapping('/:id')
 *     async getUser(@PathVariable('id') id: number) {
 *         return this.userService.getUser(id);
 *     }
 * }
 * ```
 * 
 * ✅ Both work exactly the same way!
 * ✅ No manual registration needed!
 * ✅ Just use decorators and constructor injection!
 */
