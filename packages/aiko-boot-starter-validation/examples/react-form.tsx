/**
 * React 表单验证示例
 * 
 * 演示如何在前端使用 class-validator 进行表单验证
 */
import React from 'react';
import { useForm } from 'react-hook-form';
import { classValidatorResolver } from '@hookform/resolvers/class-validator';
import { CreateUserDto, UserStatus } from './user-dto';

/**
 * 用户注册表单组件
 */
export function UserRegistrationForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserDto>({
    resolver: classValidatorResolver(CreateUserDto),
    defaultValues: {
      status: UserStatus.PENDING,
    },
  });

  const onSubmit = async (data: CreateUserDto) => {
    console.log('Form submitted:', data);
    // 调用 API
    // await fetch('/api/users', { method: 'POST', body: JSON.stringify(data) });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* 用户名 */}
      <div>
        <label htmlFor="name">用户名</label>
        <input id="name" {...register('name')} />
        {errors.name && <span className="error">{errors.name.message}</span>}
      </div>

      {/* 邮箱 */}
      <div>
        <label htmlFor="email">邮箱</label>
        <input id="email" type="email" {...register('email')} />
        {errors.email && <span className="error">{errors.email.message}</span>}
      </div>

      {/* 密码 */}
      <div>
        <label htmlFor="password">密码</label>
        <input id="password" type="password" {...register('password')} />
        {errors.password && <span className="error">{errors.password.message}</span>}
      </div>

      {/* 年龄 */}
      <div>
        <label htmlFor="age">年龄</label>
        <input id="age" type="number" {...register('age', { valueAsNumber: true })} />
        {errors.age && <span className="error">{errors.age.message}</span>}
      </div>

      {/* 手机号 */}
      <div>
        <label htmlFor="phone">手机号</label>
        <input id="phone" {...register('phone')} />
        {errors.phone && <span className="error">{errors.phone.message}</span>}
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? '提交中...' : '注册'}
      </button>
    </form>
  );
}
