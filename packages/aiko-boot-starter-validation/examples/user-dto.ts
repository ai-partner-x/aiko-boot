/**
 * User DTO 示例
 * 
 * 演示如何定义可在前后端共用的验证规则
 * 转译为 Java 时自动映射为 jakarta.validation 注解
 */
import {
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Length,
  Min,
  Max,
  IsInt,
  Matches,
  IsEnum,
  ValidateNested,
  Type,
} from '../src/index.js';

// ==================== 枚举 ====================

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

// ==================== 嵌套 DTO ====================

export class AddressDto {
  @IsNotEmpty({ message: '省份不能为空' })
  province: string;

  @IsNotEmpty({ message: '城市不能为空' })
  city: string;

  @IsOptional()
  district?: string;

  @IsOptional()
  detail?: string;
}

// ==================== 主 DTO ====================

/**
 * 创建用户 DTO
 * 
 * TypeScript:
 * ```typescript
 * @IsNotEmpty()
 * @Length(2, 50)
 * name: string;
 * ```
 * 
 * 转译为 Java:
 * ```java
 * @NotBlank
 * @Size(min = 2, max = 50)
 * private String name;
 * ```
 */
export class CreateUserDto {
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(2, 50, { message: '用户名长度必须在 2-50 之间' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 100, { message: '密码长度必须在 6-100 之间' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: '密码必须包含大小写字母和数字',
  })
  password: string;

  @IsOptional()
  @IsInt({ message: '年龄必须是整数' })
  @Min(0, { message: '年龄不能小于 0' })
  @Max(150, { message: '年龄不能大于 150' })
  age?: number;

  @IsOptional()
  @Matches(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
  phone?: string;

  @IsEnum(UserStatus, { message: '状态值无效' })
  status: UserStatus = UserStatus.PENDING;

  @IsOptional()
  @IsEnum(UserRole, { each: true, message: '角色值无效' })
  roles?: UserRole[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;
}

/**
 * 更新用户 DTO
 */
export class UpdateUserDto {
  @IsOptional()
  @Length(2, 50)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(150)
  age?: number;

  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
