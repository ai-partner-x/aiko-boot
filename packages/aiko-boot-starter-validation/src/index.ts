/**
 * @ai-partner-x/boot-starter-validation
 * 
 * Spring Boot Style Validation Starter with class-validator compatible decorators
 * 
 * Features:
 * - Auto-configuration based on validation.* config
 * - class-validator decorators re-export
 * - react-hook-form integration
 * - Java transpilation mapping
 * 
 * @example
 * ```typescript
 * import { IsNotEmpty, IsEmail, Length, Min, Max } from '@ai-partner-x/boot-starter-validation';
 * 
 * class CreateUserDto {
 *   @IsNotEmpty({ message: '姓名不能为空' })
 *   @Length(2, 50)
 *   name: string;
 * 
 *   @IsEmail()
 *   email: string;
 * 
 *   @Min(0)
 *   @Max(150)
 *   age: number;
 * }
 * ```
 */

import 'reflect-metadata';

// ==================== Re-export class-validator ====================
// 导出所有 class-validator 装饰器，保持 API 兼容

// Common validators
export {
  // Presence
  IsDefined,
  IsOptional,
  // Type
  IsString,
  IsNumber,
  IsInt,
  IsBoolean,
  IsArray,
  IsObject,
  IsDate,
  IsEnum,
  // String
  IsNotEmpty,
  IsEmpty,
  Length,
  MinLength,
  MaxLength,
  Matches,
  Contains,
  NotContains,
  IsAlpha,
  IsAlphanumeric,
  IsAscii,
  IsBase64,
  IsByteLength,
  // Number
  Min,
  Max,
  IsPositive,
  IsNegative,
  // Format
  IsEmail,
  IsUrl,
  IsUUID,
  IsIP,
  IsJSON,
  IsMobilePhone,
  IsPhoneNumber,
  IsCreditCard,
  IsCurrency,
  IsHexColor,
  // Date
  MinDate,
  MaxDate,
  // Array
  ArrayContains,
  ArrayNotContains,
  ArrayNotEmpty,
  ArrayMinSize,
  ArrayMaxSize,
  ArrayUnique,
  // Object
  IsInstance,
  // Nested
  ValidateNested,
  // Custom
  Validate,
  ValidateIf,
  ValidateBy,
  // Core
  validate,
  validateSync,
  validateOrReject,
  ValidationError,
} from 'class-validator';

// Re-export class-transformer
export {
  plainToInstance,
  instanceToPlain,
  Type,
  Exclude,
  Expose,
  Transform,
} from 'class-transformer';

// ==================== Custom Extensions ====================

/**
 * Validate an object and return formatted errors
 */
export async function validateDto<T extends object>(
  dtoClass: new () => T,
  data: Partial<T> | Record<string, unknown>
): Promise<ValidationResult<T>> {
  const { plainToInstance } = await import('class-transformer');
  const { validate } = await import('class-validator');
  
  const instance = plainToInstance(dtoClass, data);
  const errors = await validate(instance as object);
  
  if (errors.length === 0) {
    return { success: true, data: instance };
  }
  
  return {
    success: false,
    errors: errors.map(err => ({
      field: err.property,
      message: Object.values(err.constraints || {})[0] || 'Validation failed',
      constraints: err.constraints || {},
    })),
  };
}

/**
 * Validation result type
 */
export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: FieldError[];
}

/**
 * Field error type
 */
export interface FieldError {
  field: string;
  message: string;
  constraints: Record<string, string>;
}

/**
 * Create a resolver for react-hook-form
 * 
 * @example
 * ```typescript
 * import { useForm } from 'react-hook-form';
 * import { createResolver, CreateUserDto } from '@ai-partner-x/aiko-boot-starter-validation';
 * 
 * function UserForm() {
 *   const { register, handleSubmit, formState: { errors } } = useForm({
 *     resolver: createResolver(CreateUserDto),
 *   });
 *   // ...
 * }
 * ```
 */
export function createResolver<T extends object>(dtoClass: new () => T) {
  return async (data: Record<string, unknown>) => {
    const result = await validateDto(dtoClass, data);
    
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    
    const errors: Record<string, { type: string; message: string }> = {};
    result.errors?.forEach(err => {
      errors[err.field] = {
        type: 'validation',
        message: err.message,
      };
    });
    
    return { values: {}, errors };
  };
}

// ==================== Java Transpilation Mapping ====================
// 用于 codegen 转译时的映射

/**
 * Decorator to Java annotation mapping
 * Used by @ai-partner-x/codegen for Java transpilation
 */
export const JAVA_VALIDATION_MAPPING: Record<string, string> = {
  // class-validator -> jakarta.validation
  'IsNotEmpty': '@NotBlank',
  'IsDefined': '@NotNull',
  'IsOptional': '',  // No direct mapping
  'IsString': '',    // Type check only
  'IsNumber': '',    // Type check only
  'IsInt': '',       // Type check only
  'IsBoolean': '',   // Type check only
  'IsEmail': '@Email',
  'IsUrl': '@URL',
  'Length': '@Size',
  'MinLength': '@Size(min = %s)',
  'MaxLength': '@Size(max = %s)',
  'Min': '@Min(%s)',
  'Max': '@Max(%s)',
  'IsPositive': '@Positive',
  'IsNegative': '@Negative',
  'Matches': '@Pattern(regexp = "%s")',
  'IsUUID': '@UUID',
  'ValidateNested': '@Valid',
  'ArrayNotEmpty': '@NotEmpty',
  'ArrayMinSize': '@Size(min = %s)',
  'ArrayMaxSize': '@Size(max = %s)',
};

// ==================== Auto Configuration ====================

export {
  ValidationAutoConfiguration,
  ValidationProperties,
  getValidationConfig,
  setValidationConfig,
} from './auto-configuration.js';

// Config Augmentation (扩展 @ai-partner-x/aiko-boot 的 AppConfig)
import './config-augment.js';
