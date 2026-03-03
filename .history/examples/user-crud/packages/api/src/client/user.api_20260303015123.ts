/**
 * UserApi - API 契约（前端 Feign Client）
 *
 * 使用 @RestController 而非 @ApiContract，与 UserController 使用相同的装饰器
 * 这样 createApiClient 可以直接读取相同的元数据
 *
 * 用法：
 *   import { UserApi } from '@user-crud/api/client';
 *   const userApi = createApiClient(UserApi, { baseUrl: 'http://localhost:3001' });
 *   const users = await userApi.list();
 */
import 'reflect-metadata';
import {
  RestController,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
} from '@ai-first/nextjs';
import type { User, CreateUserDto, UpdateUserDto } from '../shared/types';

@RestController({ path: '/users' })
export class UserApi {
  @GetMapping()
  list(): Promise<User[]> {
    return null!;
  }

  @GetMapping('/:id')
  getById(@PathVariable('id') id: string): Promise<User | null> {
    return null!;
  }

  @PostMapping()
  create(@RequestBody() dto: CreateUserDto): Promise<User> {
    return null!;
  }

  @PutMapping('/:id')
  update(
    @PathVariable('id') id: string,
    @RequestBody() dto: UpdateUserDto,
  ): Promise<User> {
    return null!;
  }

  @DeleteMapping('/:id')
  delete(@PathVariable('id') id: string): Promise<{ success: boolean }> {
    return null!;
  }
}
