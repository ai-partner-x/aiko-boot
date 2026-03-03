/**
 * UserApi - API 契约定义（前后端共享的单一来源）
 *
 * 这是唯一的 API 定义：
 *   - 后端使用此契约注册路由，提供实现
 *   - 前端通过 createApiClient(UserApi, config) 自动生成 fetch 调用
 *
 * 类比 Java：同时是 @FeignClient 和 Controller 接口的角色
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
import type { User, CreateUserDto, UpdateUserDto } from './user';

@RestController({ path: '/users' })
export class UserApi {
  @GetMapping()
  list(): Promise<User[]> { return null!; }

  @GetMapping('/:id')
  getById(@PathVariable('id') id: string): Promise<User | null> { return null!; }

  @PostMapping()
  create(@RequestBody() dto: CreateUserDto): Promise<User> { return null!; }

  @PutMapping('/:id')
  update(
    @PathVariable('id') id: string,
    @RequestBody() dto: UpdateUserDto,
  ): Promise<User> { return null!; }

  @DeleteMapping('/:id')
  delete(@PathVariable('id') id: string): Promise<{ success: boolean }> { return null!; }
}
}
