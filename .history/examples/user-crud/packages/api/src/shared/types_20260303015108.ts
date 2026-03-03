/**
 * 共享类型定义 - 纯 TypeScript interface，无任何装饰器
 * 前端（admin/mall-mobile）和后端（controller/dto）都使用这些类型
 */

// ==================== Entity ====================

export interface User {
  id: number;
  username: string;
  email: string;
  age?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ==================== DTO ====================

export interface CreateUserDto {
  username: string;
  email: string;
  age?: number;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  age?: number;
}

// ==================== API Response ====================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}
