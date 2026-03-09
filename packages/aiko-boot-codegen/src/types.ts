/**
 * Type definitions for code generation
 */

/**
 * TypeScript to Java type mapping
 */
export const TYPE_MAPPING: Record<string, string> = {
  'number': 'Integer',
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
 * Import module mapping: TypeScript module -> Java imports
 * Key: TypeScript module path (or named import)
 * Value: Java import statement(s)
 */
export const IMPORT_MAPPING: Record<string, string[]> = {
  // Aiko Boot framework imports
  '@ai-partner-x/aiko-boot': [
    'org.springframework.stereotype.Service',
    'org.springframework.web.bind.annotation.RestController',
    'org.springframework.beans.factory.annotation.Autowired',
    'org.springframework.transaction.annotation.Transactional',
  ],
  '@ai-partner-x/aiko-boot-starter-orm': [
    'com.baomidou.mybatisplus.core.conditions.query.QueryWrapper',
    'com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper',
    'com.baomidou.mybatisplus.core.mapper.BaseMapper',
    'com.baomidou.mybatisplus.annotation.*',
  ],
  '@ai-partner-x/aiko-boot-starter-validation': [
    'jakarta.validation.Valid',
    'jakarta.validation.constraints.*',
  ],
  
  // Named import specific mappings
  'Service': ['org.springframework.stereotype.Service'],
  'RestController': ['org.springframework.web.bind.annotation.RestController'],
  'Autowired': ['org.springframework.beans.factory.annotation.Autowired'],
  'Transactional': ['org.springframework.transaction.annotation.Transactional'],
  'GetMapping': ['org.springframework.web.bind.annotation.GetMapping'],
  'PostMapping': ['org.springframework.web.bind.annotation.PostMapping'],
  'PutMapping': ['org.springframework.web.bind.annotation.PutMapping'],
  'DeleteMapping': ['org.springframework.web.bind.annotation.DeleteMapping'],
  'PathVariable': ['org.springframework.web.bind.annotation.PathVariable'],
  'RequestParam': ['org.springframework.web.bind.annotation.RequestParam'],
  'RequestBody': ['org.springframework.web.bind.annotation.RequestBody'],
  'QueryWrapper': ['com.baomidou.mybatisplus.core.conditions.query.QueryWrapper'],
  'UpdateWrapper': ['com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper'],
  'BaseMapper': ['com.baomidou.mybatisplus.core.mapper.BaseMapper'],
  'TableId': ['com.baomidou.mybatisplus.annotation.TableId'],
  'TableField': ['com.baomidou.mybatisplus.annotation.TableField'],
  'TableName': ['com.baomidou.mybatisplus.annotation.TableName'],
  'Mapper': ['org.apache.ibatis.annotations.Mapper'],
  'validateDto': [], // Skip - handled by @Valid
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
 * Parsed import statement
 */
export interface ParsedImport {
  /** Module path: '@ai-partner-x/aiko-boot' */
  modulePath: string;
  /** Named imports: ['Service', 'Autowired'] */
  namedImports: string[];
  /** Default import: 'React' */
  defaultImport?: string;
  /** Namespace import: '* as fs' */
  namespaceImport?: string;
  /** Is type-only import */
  isTypeOnly: boolean;
}

/**
 * Parsed comment (JSDoc or line comment)
 */
export interface ParsedComment {
  /** Comment type */
  type: 'jsdoc' | 'line' | 'block';
  /** Comment text (without delimiters) */
  text: string;
  /** JSDoc tags if applicable */
  tags?: { tag: string; text: string }[];
}

/**
 * Parsed source file (top-level)
 */
export interface ParsedSourceFile {
  /** File path */
  filePath: string;
  /** Import statements */
  imports: ParsedImport[];
  /** Classes in file */
  classes: ParsedClass[];
  /** Interfaces in file (converted to DTO classes in Java) */
  interfaces: ParsedInterface[];
  /** Top-level comments */
  comments: ParsedComment[];
}

/**
 * Parsed interface information (for generating Java DTO classes)
 */
export interface ParsedInterface {
  name: string;
  /** Interface properties (converted to Java fields) */
  properties: ParsedInterfaceProperty[];
  /** Interface-level JSDoc comment */
  comment?: ParsedComment;
  /** Whether it's exported */
  isExported: boolean;
}

/**
 * Parsed interface property
 */
export interface ParsedInterfaceProperty {
  name: string;
  type: string;
  optional: boolean;
  /** Property-level comment */
  comment?: string;
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
  /** Class-level JSDoc comment */
  comment?: ParsedComment;
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
  /** Field-level comment */
  comment?: ParsedComment;
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
  /** Method body statements (for transpilation) */
  body?: ParsedStatement[];
  /** Method-level JSDoc comment */
  comment?: ParsedComment;
}

/**
 * Parsed statement types
 */
export type ParsedStatement = 
  | ParsedReturnStatement
  | ParsedVariableDeclaration
  | ParsedDestructuringDeclaration
  | ParsedIfStatement
  | ParsedForStatement
  | ParsedExpressionStatement
  | ParsedBlockStatement
  | ParsedThrowStatement;

export interface ParsedReturnStatement {
  type: 'return';
  expression?: ParsedExpression;
}

export interface ParsedVariableDeclaration {
  type: 'variable';
  name: string;
  varType: string;
  isConst: boolean;
  initializer?: ParsedExpression;
}

export interface ParsedIfStatement {
  type: 'if';
  condition: ParsedExpression;
  thenBlock: ParsedStatement[];
  elseBlock?: ParsedStatement[];
}

export interface ParsedForStatement {
  type: 'for';
  kind: 'for' | 'forOf' | 'forEach';
  variable?: string;
  iterable?: ParsedExpression;
  body: ParsedStatement[];
}

export interface ParsedExpressionStatement {
  type: 'expression';
  expression: ParsedExpression;
}

export interface ParsedBlockStatement {
  type: 'block';
  statements: ParsedStatement[];
}

/**
 * Destructuring assignment: const { a, b } = obj
 */
export interface ParsedDestructuringDeclaration {
  type: 'destructuring';
  /** Variable names from destructuring */
  variables: { name: string; defaultValue?: ParsedExpression }[];
  /** Source object expression */
  source: ParsedExpression;
  /** Source object type (for type inference) */
  sourceType: string;
  isConst: boolean;
}

/**
 * Throw statement: throw new Error(...)
 */
export interface ParsedThrowStatement {
  type: 'throw';
  expression: ParsedExpression;
}

/**
 * Parsed expression types
 */
export type ParsedExpression =
  | ParsedLiteral
  | ParsedIdentifier
  | ParsedPropertyAccess
  | ParsedMethodCall
  | ParsedBinaryExpression
  | ParsedNewExpression
  | ParsedAwaitExpression
  | ParsedObjectLiteral
  | ParsedArrayLiteral
  | ParsedConditionalExpression
  | ParsedElementAccessExpression
  | ParsedRawExpression;

export interface ParsedLiteral {
  type: 'literal';
  value: string | number | boolean | null;
  literalType: 'string' | 'number' | 'boolean' | 'null';
}

export interface ParsedIdentifier {
  type: 'identifier';
  name: string;
}

export interface ParsedPropertyAccess {
  type: 'propertyAccess';
  object: ParsedExpression;
  property: string;
}

export interface ParsedMethodCall {
  type: 'methodCall';
  object?: ParsedExpression;
  method: string;
  arguments: ParsedExpression[];
  /** For chained calls like wrapper.eq().gt() */
  isChained?: boolean;
}

export interface ParsedBinaryExpression {
  type: 'binary';
  left: ParsedExpression;
  operator: string;
  right: ParsedExpression;
}

export interface ParsedNewExpression {
  type: 'new';
  className: string;
  typeArguments?: string[];
  arguments: ParsedExpression[];
}

export interface ParsedAwaitExpression {
  type: 'await';
  expression: ParsedExpression;
}

export interface ParsedObjectLiteral {
  type: 'object';
  properties: { key: string; value: ParsedExpression }[];
}

export interface ParsedArrayLiteral {
  type: 'array';
  elements: ParsedExpression[];
}

export interface ParsedConditionalExpression {
  type: 'conditional';
  condition: ParsedExpression;
  whenTrue: ParsedExpression;
  whenFalse: ParsedExpression;
}

export interface ParsedElementAccessExpression {
  type: 'elementAccess';
  object: ParsedExpression;
  index: ParsedExpression;
}

export interface ParsedRawExpression {
  type: 'raw';
  code: string;
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

/**
 * Utility type usage tracking (Omit, Pick, Partial)
 */
export interface UtilityTypeUsage {
  /** Original utility type expression: Omit<User, 'id'> */
  original: string;
  /** Utility type name: Omit, Pick, Partial */
  utility: 'Omit' | 'Pick' | 'Partial' | 'Required';
  /** Base type name: User */
  baseType: string;
  /** Fields to exclude (for Omit) or include (for Pick) */
  fields: string[];
  /** Generated Java class name: UserWithoutId */
  generatedClassName: string;
}
