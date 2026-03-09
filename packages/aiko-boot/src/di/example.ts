/**
 * Usage Examples
 * This file demonstrates how to use @ai-partner-x/aiko-boot/di
 */

import { Injectable, Singleton, Inject, Container } from './index.js';

// ==================== Example 1: Basic Service ====================

@Injectable()
class Logger {
  log(message: string) {
    console.log(`[LOG] ${message}`);
  }
}

@Injectable()
class UserRepository {
  constructor(@Inject(Logger) private logger: Logger) {}

  async findById(id: number) {
    this.logger.log(`Finding user ${id}`);
    return { id, name: 'John Doe' };
  }
}

@Injectable()
class UserService {
  constructor(@Inject(UserRepository) private userRepo: UserRepository) {}

  async getUser(id: number) {
    return this.userRepo.findById(id);
  }
}

// ==================== Example 2: Singleton Service ====================

@Singleton()
class ConfigService {
  private config = {
    apiUrl: 'https://api.example.com',
    timeout: 5000,
  };

  get(key: string) {
    return (this.config as any)[key];
  }
}

// ==================== Example 3: Usage ====================

// Register services
Container.registerAll([
  { token: Logger, target: Logger },
  { token: UserRepository, target: UserRepository },
  { token: UserService, target: UserService },
]);

// Resolve and use
const userService = Container.resolve(UserService);
userService.getUser(1).then((user) => {
  console.log('User:', user);
});

// Singleton is automatically registered by decorator
const config = Container.resolve(ConfigService);
console.log('API URL:', config.get('apiUrl'));
