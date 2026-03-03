/**
 * Next.js Server Action 验证示例
 * 
 * 演示如何在后端使用 class-validator 进行验证
 */
// 'use server';

import { validateDto, CreateUserDto } from '../src/index.js';

/**
 * 创建用户 Server Action
 */
export async function createUser(formData: FormData) {
  // 从 FormData 提取数据
  const data = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    age: formData.get('age') ? Number(formData.get('age')) : undefined,
    phone: formData.get('phone') || undefined,
  };

  // 使用 validateDto 验证
  const result = await validateDto(CreateUserDto, data);

  if (!result.success) {
    return {
      success: false,
      errors: result.errors,
    };
  }

  // 验证通过，处理业务逻辑
  const user = result.data!;
  
  // 保存到数据库...
  // const savedUser = await userRepository.save(user);

  return {
    success: true,
    data: { id: 1, ...user },
  };
}

/**
 * 直接使用 validate 函数验证
 */
import { validate, plainToInstance } from '../src/index.js';

export async function validateUserData(data: Record<string, unknown>) {
  // 转换为 DTO 实例
  const instance = plainToInstance(CreateUserDto, data);
  
  // 验证
  const errors = await validate(instance);
  
  if (errors.length > 0) {
    return {
      valid: false,
      errors: errors.map(err => ({
        field: err.property,
        messages: Object.values(err.constraints || {}),
      })),
    };
  }

  return { valid: true, data: instance };
}
