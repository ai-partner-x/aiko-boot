/**
 * @user-crud/api/client
 * 
 * 前端专用入口 - 只导出前端需要的内容
 * 不会导出 Controller、Service、Mapper 等后端实现
 */

// API 契约类（用于 createApiClient）
export { UserApi } from './user.api';

// 共享类型（纯 interface）
export type {
  User,
  CreateUserDto,
  UpdateUserDto,
  ApiResponse,
} from '../shared/types';
