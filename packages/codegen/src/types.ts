/**
 * Type definitions for code generation
 */

/**
 * TypeScript to Java type mapping
 */
export const TYPE_MAPPING: Record<string, string> = {
  'number': 'Long',
  'string': 'String',
  'boolean': 'Boolean',
  'Date': 'LocalDateTime',
  'any': 'Object',
  'void': 'void',
  'null': 'null',
  'undefined': 'null',
};

/**
 * Decorator mapping from TypeScript to Java
 */
export const DECORATOR_MAPPING: Record<string, string> = {
  // Class decorators
  'Entity': '@TableName',          // MyBatis-Plus
  'Repository': '@Repository',
  'Service': '@Service',
  'RestController': '@RestController',
  
  // Method decorators
  'GetMapping': '@GetMapping',
  'PostMapping': '@PostMapping',
  'PutMapping': '@PutMapping',
  'DeleteMapping': '@DeleteMapping',
  'PatchMapping': '@PatchMapping',
  'Transactional': '@Transactional',
  
  // Parameter decorators
  'PathVariable': '@PathVariable',
  'RequestParam': '@RequestParam',
  'RequestBody': '@RequestBody',
  
  // Field decorators (MyBatis-Plus)
  'DbField': '@TableField',
  'Field': '',  // Ignored, just metadata
  'Validation': '',  // Converted to Jakarta Validation
};

/**
 * Validation annotation mapping
 */
export const VALIDATION_MAPPING: Record<string, string> = {
  'required': '@NotNull',
  'email': '@Email',
  'min': '@Min',
  'max': '@Max',
};

/**
 * Java imports - MyBatis-Plus version
 */
export const JAVA_IMPORTS = {
  mybatisPlus: [
    'com.baomidou.mybatisplus.annotation.TableName',
    'com.baomidou.mybatisplus.annotation.TableId',
    'com.baomidou.mybatisplus.annotation.TableField',
    'com.baomidou.mybatisplus.annotation.IdType',
    'com.baomidou.mybatisplus.core.mapper.BaseMapper',
    'com.baomidou.mybatisplus.extension.service.IService',
    'com.baomidou.mybatisplus.extension.service.impl.ServiceImpl',
  ],
  spring: [
    'org.springframework.stereotype.Repository',
    'org.springframework.stereotype.Service',
    'org.springframework.web.bind.annotation.RestController',
    'org.springframework.web.bind.annotation.RequestMapping',
    'org.springframework.web.bind.annotation.GetMapping',
    'org.springframework.web.bind.annotation.PostMapping',
    'org.springframework.web.bind.annotation.PutMapping',
    'org.springframework.web.bind.annotation.DeleteMapping',
    'org.springframework.web.bind.annotation.PathVariable',
    'org.springframework.web.bind.annotation.RequestParam',
    'org.springframework.web.bind.annotation.RequestBody',
    'org.springframework.beans.factory.annotation.Autowired',
    'org.springframework.transaction.annotation.Transactional',
  ],
  validation: [
    'jakarta.validation.constraints.NotNull',
    'jakarta.validation.constraints.Email',
    'jakarta.validation.constraints.Min',
    'jakarta.validation.constraints.Max',
    'jakarta.validation.Valid',
  ],
  util: [
    'java.util.List',
    'java.util.Optional',
    'java.time.LocalDateTime',
    'java.time.LocalDate',
  ],
  lombok: [
    'lombok.Data',
    'lombok.NoArgsConstructor',
    'lombok.AllArgsConstructor',
  ],
};

/**
 * Transpiler options
 */
export interface TranspilerOptions {
  /** Output directory */
  outDir: string;
  /** Java package name */
  packageName: string;
  /** Java version */
  javaVersion?: '11' | '17' | '21';
  /** Spring Boot version */
  springBootVersion?: string;
  /** Generate Lombok annotations */
  useLombok?: boolean;
}

/**
 * Parsed class information
 */
export interface ParsedClass {
  name: string;
  decorators: ParsedDecorator[];
  fields: ParsedField[];
  methods: ParsedMethod[];
  constructor?: ParsedConstructor;
}

/**
 * Parsed decorator
 */
export interface ParsedDecorator {
  name: string;
  args: Record<string, any>;
}

/**
 * Parsed field
 */
export interface ParsedField {
  name: string;
  type: string;
  decorators: ParsedDecorator[];
  optional: boolean;
}

/**
 * Parsed method
 */
export interface ParsedMethod {
  name: string;
  returnType: string;
  parameters: ParsedParameter[];
  decorators: ParsedDecorator[];
  isAsync: boolean;
}

/**
 * Parsed parameter
 */
export interface ParsedParameter {
  name: string;
  type: string;
  decorators: ParsedDecorator[];
}

/**
 * Parsed constructor
 */
export interface ParsedConstructor {
  parameters: ParsedParameter[];
}
