/**
 * User 领域相关的共享类型
 * 前端（admin / mall-mobile）和后端（api）统一 import 这里的类型
 */

// ==================== Entity ====================

export interface User {
  id: number;
  username: string;
  email: string;
  age?: number;
  createdAt?: string; // 前端统一用 string（JSON 序列化后 Date 变 string）
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
