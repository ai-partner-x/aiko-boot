import { IsNotEmpty, IsEmail, IsOptional, Length, Min, Max, IsInt } from '@ai-partner-x/aiko-boot-starter-validation';
import { User } from '../entity/user.entity.js';

export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(2, 50, { message: '用户名长度必须在 2-50 之间' })
  username!: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;

  @IsOptional()
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  @Max(150, { message: '年龄不能大于 150' })
  age?: number;
}

export class UpdateUserDto {
  @IsOptional()
  @Length(2, 50)
  username?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;
}

/**
 * 批量更新年龄请求 DTO
 */
export class BatchUpdateAgeDto {
  @IsNotEmpty({ message: '用户名关键字不能为空' })
  username!: string;

  @IsNotEmpty({ message: '年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  @Max(150, { message: '年龄不能大于 150' })
  age!: number;
}

/**
 * 更新邮箱请求 DTO
 */
export class UpdateEmailDto {
  @IsNotEmpty({ message: '邮箱不能为空' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email!: string;
}

/**
 * 批量删除请求 DTO
 */
export class BatchDeleteDto {
  @IsNotEmpty({ message: '最小年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  minAge!: number;

  @IsNotEmpty({ message: '最大年龄不能为空' })
  @IsInt({ message: '年龄必须是整数' })
  @Max(150, { message: '年龄不能大于 150' })
  maxAge!: number;
}

/**
 * 操作成功响应 DTO
 */
export class SuccessResponse {
  success!: boolean;
}

/**
 * 更新操作响应 DTO
 */
export class UpdateResponse {
  success!: boolean;
  updated!: number;
}

/**
 * 删除操作响应 DTO
 */
export class DeleteResponse {
  success!: boolean;
  deleted!: number;
}

/**
 * 用户搜索结果 DTO
 */
export class UserSearchResultDto {
  data!: User[];
  total!: number;
  page!: number;
  pageSize!: number;
}
