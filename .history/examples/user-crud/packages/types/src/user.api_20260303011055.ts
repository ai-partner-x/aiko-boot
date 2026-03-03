/**
 * UserApi - API 契约定义（TypeScript 版 Feign Client 接口）
 *
 * 这是前后端共享的"契约"：
 *   - 后端 UserController 实现这些方法
 *   - 前端通过 createApiClient(UserApi, config) 自动生成 fetch 调用
 *
 * 类比 Java：
 *   @FeignClient(url = "http://localhost:3001")
 *   public interface UserApi { ... }
 */
import 'reflect-metadata';
import {
  ApiContract,
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PathVariable,
  RequestBody,
} from '@ai-first/nextjs';
import type { User, CreateUserDto, UpdateUserDto } from './user';

@ApiContract({ path: '/users' })
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
