/**
 * Method Body Generator
 * Transpiles TypeScript method bodies to Java code
 */
import { TYPE_MAPPING } from './types.js';
import { registerUtilityTypeUsage } from './generator.js';
import type { 
  ParsedStatement, ParsedExpression, ParsedMethod,
  ParsedReturnStatement, ParsedVariableDeclaration, ParsedIfStatement,
  ParsedForStatement, ParsedExpressionStatement, ParsedBlockStatement,
  ParsedMethodCall, ParsedBinaryExpression, ParsedNewExpression,
  ParsedDestructuringDeclaration, ParsedThrowStatement,
  ParsedConditionalExpression, ParsedElementAccessExpression
} from './types.js';

/**
 * Generate Java method body from parsed statements
 */
export function generateMethodBody(method: ParsedMethod, indent: string = '        '): string[] {
  const lines: string[] = [];
  
  if (!method.body || method.body.length === 0) {
    // Default implementation
    lines.push(`${indent}// TODO: Implement`);
    if (method.returnType !== 'void') {
      lines.push(`${indent}return null;`);
    }
    return lines;
  }
  
  for (const stmt of method.body) {
    lines.push(...generateStatement(stmt, indent));
  }
  
  return lines;
}

/**
 * Generate Java code for a statement
 */
function generateStatement(stmt: ParsedStatement, indent: string): string[] {
  const lines: string[] = [];
  
  switch (stmt.type) {
    case 'return':
      lines.push(...generateReturnStatement(stmt, indent));
      break;
    case 'variable':
      lines.push(...generateVariableDeclaration(stmt, indent));
      break;
    case 'destructuring':
      lines.push(...generateDestructuringDeclaration(stmt, indent));
      break;
    case 'throw':
      lines.push(...generateThrowStatement(stmt, indent));
      break;
    case 'if':
      lines.push(...generateIfStatement(stmt, indent));
      break;
    case 'for':
      lines.push(...generateForStatement(stmt, indent));
      break;
    case 'expression':
      lines.push(...generateExpressionStatement(stmt, indent));
      break;
    case 'block':
      lines.push(...generateBlockStatement(stmt, indent));
      break;
  }
  
  return lines;
}

/**
 * Generate return statement
 */
function generateReturnStatement(stmt: ParsedReturnStatement, indent: string): string[] {
  if (!stmt.expression) {
    return [`${indent}return;`];
  }
  return [`${indent}return ${generateExpression(stmt.expression)};`];
}

/**
 * Generate variable declaration
 */
function generateVariableDeclaration(stmt: ParsedVariableDeclaration, indent: string): string[] {
  let javaType = mapType(stmt.varType);
  
  // Infer type from initializer if type is 'any' or 'Object'
  if ((javaType === 'Object' || javaType === 'any') && stmt.initializer) {
    javaType = inferTypeFromExpression(stmt.initializer);
  }
  
  // Handle object literal assignment to typed variable
  // e.g., const result: UserSearchResult = { data, total }
  // -> UserSearchResult result = new UserSearchResult(); result.setData(data); result.setTotal(total);
  if (stmt.initializer && stmt.initializer.type === 'object' && isKnownClassType(javaType)) {
    return generateObjectToClassConstruction(stmt.name, javaType, stmt.initializer as any, indent, stmt.isConst);
  }
  
  const init = stmt.initializer ? ` = ${generateExpression(stmt.initializer)}` : '';
  // In Java, final is for constants
  const modifier = stmt.isConst ? 'final ' : '';
  return [`${indent}${modifier}${javaType} ${stmt.name}${init};`];
}

/**
 * Check if a type is a known class type (not primitive or Map)
 */
function isKnownClassType(javaType: string): boolean {
  const primitiveTypes = ['String', 'Integer', 'Long', 'Double', 'Float', 'Boolean', 'Object', 'void', 'var'];
  const collectionTypes = ['List', 'Map', 'Set', 'HashMap', 'ArrayList'];
  
  // Check if it's a primitive or collection
  if (primitiveTypes.includes(javaType)) return false;
  if (collectionTypes.some(t => javaType.startsWith(t))) return false;
  
  // It's a class type (User, UserSearchResult, etc.)
  return /^[A-Z]/.test(javaType);
}

/**
 * Generate object literal as class construction with setters
 */
function generateObjectToClassConstruction(
  varName: string,
  className: string,
  objectLiteral: { properties: { key: string; value: ParsedExpression }[] },
  indent: string,
  isConst: boolean
): string[] {
  const lines: string[] = [];
  const modifier = isConst ? 'final ' : '';
  
  // Create instance
  lines.push(`${indent}${modifier}${className} ${varName} = new ${className}();`);
  
  // Set properties using setters
  for (const prop of objectLiteral.properties) {
    const capitalizedKey = prop.key.charAt(0).toUpperCase() + prop.key.slice(1);
    let value = generateExpression(prop.value);
    
    // For 'id' field with numeric value, append 'L' for Long type
    if (prop.key === 'id' && prop.value.type === 'literal' && (prop.value as any).literalType === 'number') {
      value = `${value}L`;
    }
    
    lines.push(`${indent}${varName}.set${capitalizedKey}(${value});`);
  }
  
  return lines;
}


/**
 * Generate destructuring declaration
 * TypeScript: const { a, b = 1, c } = obj;
 * Java: 
 *   var a = obj.getA();
 *   var b = obj.getB() != null ? obj.getB() : 1;
 *   var c = obj.getC();
 */
function generateDestructuringDeclaration(stmt: ParsedDestructuringDeclaration, indent: string): string[] {
  const lines: string[] = [];
  const sourceExpr = generateExpression(stmt.source);
  
  for (const variable of stmt.variables) {
    const getterName = `get${variable.name.charAt(0).toUpperCase()}${variable.name.slice(1)}`;
    
    if (variable.defaultValue) {
      // With default value: var a = obj.getA() != null ? obj.getA() : defaultValue;
      const defaultExpr = generateExpression(variable.defaultValue);
      lines.push(`${indent}var ${variable.name} = ${sourceExpr}.${getterName}() != null ? ${sourceExpr}.${getterName}() : ${defaultExpr};`);
    } else {
      // Simple getter: var a = obj.getA();
      lines.push(`${indent}var ${variable.name} = ${sourceExpr}.${getterName}();`);
    }
  }
  
  return lines;
}

/**
 * Generate throw statement
 * TypeScript: throw new Error('message');
 * Java: throw new RuntimeException("message");
 */
function generateThrowStatement(stmt: ParsedThrowStatement, indent: string): string[] {
  const expr = stmt.expression;
  
  // Handle throw new Error(...) -> throw new RuntimeException(...)
  if (expr.type === 'new' && (expr as ParsedNewExpression).className === 'Error') {
    const newExpr = expr as ParsedNewExpression;
    const args = newExpr.arguments.map(arg => generateExpression(arg)).join(', ');
    return [`${indent}throw new RuntimeException(${args});`];
  }
  
  // Generic throw
  return [`${indent}throw new RuntimeException(${generateExpression(expr)});`];
}

/**
 * Infer Java type from expression
 */
function inferTypeFromExpression(expr: ParsedExpression): string {
  if (expr.type === 'new') {
    const newExpr = expr as ParsedNewExpression;
    if (newExpr.typeArguments && newExpr.typeArguments.length > 0) {
      return `${newExpr.className}<${newExpr.typeArguments.map(mapType).join(', ')}>`;
    }
    return newExpr.className;
  }
  if (expr.type === 'methodCall') {
    const callExpr = expr as ParsedMethodCall;
    // Infer from method name patterns
    if (callExpr.method === 'selectById' || callExpr.method === 'selectOne') {
      return 'User'; // Will need context for actual type
    }
  }
  return 'var'; // Use Java var for type inference
}

/**
 * Generate if statement
 */
function generateIfStatement(stmt: ParsedIfStatement, indent: string): string[] {
  const lines: string[] = [];
  const condition = generateConditionExpression(stmt.condition);
  
  lines.push(`${indent}if (${condition}) {`);
  for (const s of stmt.thenBlock) {
    lines.push(...generateStatement(s, indent + '    '));
  }
  
  if (stmt.elseBlock && stmt.elseBlock.length > 0) {
    lines.push(`${indent}} else {`);
    for (const s of stmt.elseBlock) {
      lines.push(...generateStatement(s, indent + '    '));
    }
  }
  
  lines.push(`${indent}}`);
  return lines;
}

/**
 * Generate condition expression with proper null/truthiness handling
 */
function generateConditionExpression(expr: ParsedExpression): string {
  // Handle simple identifier truthiness check: if (user) -> if (user != null)
  if (expr.type === 'identifier') {
    return `${expr.name} != null`;
  }
  
  // Handle negation: if (!user) -> if (user == null)
  if (expr.type === 'raw' && typeof expr.code === 'string') {
    const code = expr.code.trim();
    if (code.startsWith('!') && !code.includes(' ')) {
      const varName = code.slice(1);
      return `${varName} == null`;
    }
  }
  
  return generateExpression(expr);
}

/**
 * Generate for statement
 */
function generateForStatement(stmt: ParsedForStatement, indent: string): string[] {
  const lines: string[] = [];
  
  if (stmt.kind === 'forOf' && stmt.variable && stmt.iterable) {
    // for (const item of items) -> for (var item : items)
    const iterable = generateExpression(stmt.iterable);
    lines.push(`${indent}for (var ${stmt.variable} : ${iterable}) {`);
    for (const s of stmt.body) {
      lines.push(...generateStatement(s, indent + '    '));
    }
    lines.push(`${indent}}`);
  }
  
  return lines;
}

/**
 * Generate expression statement
 */
function generateExpressionStatement(stmt: ParsedExpressionStatement, indent: string): string[] {
  const expression = generateExpression(stmt.expression);
  // Skip empty expressions (e.g., from removed method calls like wrapper.page())
  if (!expression || expression.trim() === '') {
    return [];
  }
  return [`${indent}${expression};`];
}

/**
 * Generate block statement
 */
function generateBlockStatement(stmt: ParsedBlockStatement, indent: string): string[] {
  const lines: string[] = [];
  lines.push(`${indent}{`);
  for (const s of stmt.statements) {
    lines.push(...generateStatement(s, indent + '    '));
  }
  lines.push(`${indent}}`);
  return lines;
}

/**
 * Generate expression
 */
function generateExpression(expr: ParsedExpression): string {
  switch (expr.type) {
    case 'literal':
      return generateLiteral(expr);
    case 'identifier':
      return translateIdentifier(expr.name);
    case 'propertyAccess':
      return generatePropertyAccess(expr);
    case 'methodCall':
      return generateMethodCall(expr);
    case 'binary':
      return generateBinaryExpression(expr);
    case 'new':
      return generateNewExpression(expr);
    case 'await':
      // Java doesn't have await, just call the expression
      return generateExpression(expr.expression);
    case 'object':
      return generateObjectLiteral(expr);
    case 'array':
      return `Arrays.asList(${expr.elements.map(generateExpression).join(', ')})`;
    case 'conditional':
      return generateConditionalExpression(expr);
    case 'elementAccess':
      return generateElementAccessExpression(expr);
    case 'raw':
      return cleanRawCode(expr.code);
    default:
      return '/* unsupported expression */';
  }
}

/**
 * Generate property access expression
 * In Java, private fields are accessed via getters
 */
function generatePropertyAccess(expr: { object: ParsedExpression; property: string }): string {
  const obj = generateExpression(expr.object);
  const prop = expr.property;
  
  // Special properties that don't need getter conversion
  const specialProps = ['length', 'size', 'success', 'errors', 'message'];
  if (specialProps.includes(prop)) {
    return `${obj}.${translatePropertyName(prop)}`;
  }
  
  // Check if object is 'this', it's internal field access - no getter needed
  if (obj === 'this') {
    return `this.${prop}`;
  }
  
  // For other objects, convert to getter: obj.prop -> obj.getProp()
  const capitalizedProp = prop.charAt(0).toUpperCase() + prop.slice(1);
  return `${obj}.get${capitalizedProp}()`;
}

/**
 * Clean raw code from TypeScript syntax
 */
function cleanRawCode(code: string): string {
  // Remove type assertions: as unknown as Date, as any, etc.
  code = code.replace(/\s+as\s+\w+(\s+as\s+\w+)*/g, '');
  
  // Replace undefined with null
  code = code.replace(/\bundefined\b/g, 'null');
  
  // Replace Number(x) with Integer.valueOf(x)
  code = code.replace(/Number\(([^)]+)\)/g, 'Integer.valueOf($1)');
  
  // Replace new Date() with LocalDateTime.now()
  code = code.replace(/new Date\(\)\.toISOString\(\)/g, 'LocalDateTime.now()');
  code = code.replace(/new Date\(\)/g, 'LocalDateTime.now()');
  
  // Replace arrow functions: w => w.like(...) -> (w) -> w.like(...)
  code = code.replace(/(\w+)\s*=>\s*/g, '($1) -> ');
  
  // Replace single quotes with double quotes for strings
  code = code.replace(/'([^']+)'/g, '"$1"');
  
  // Remove non-null assertions: x!
  code = code.replace(/(\w+)!/g, '$1');
  
  // Fix bracket access on objects: obj['prop'] -> obj.get("prop") or just obj.prop for simple cases
  code = code.replace(/(\w+)\['(\w+)'\]/g, '$1.get("$2")');
  code = code.replace(/(\w+)\["(\w+)"\]/g, '$1.get("$2")');
  
  return code;
}

/**
 * Translate identifier names
 */
function translateIdentifier(name: string): string {
  // Replace undefined with null
  if (name === 'undefined') return 'null';
  return name;
}

/**
 * Translate property names
 */
function translatePropertyName(name: string): string {
  // length -> size() for collections
  if (name === 'length') return 'size()';
  return name;
}

/**
 * Generate literal
 */
function generateLiteral(expr: { value: string | number | boolean | null; literalType: string }): string {
  if (expr.literalType === 'string') {
    return `"${expr.value}"`;
  }
  if (expr.literalType === 'null') {
    return 'null';
  }
  return String(expr.value);
}

/**
 * Generate method call
 */
function generateMethodCall(expr: ParsedMethodCall): string {
  // Skip wrapper.page() - QueryWrapper doesn't have this method
  // Pagination should be handled via Page class in Java
  if (expr.method === 'page') {
    // Return empty string to skip this statement entirely
    return '';
  }
  
  // Process arguments - keep as-is from source
  // The Entity's @TableField annotation handles column name mapping
  const args = expr.arguments.map((arg) => {
    return generateExpression(arg);
  }).join(', ');
  
  // Handle special method translations
  const methodName = translateMethodName(expr.method);
  
  if (expr.object) {
    const obj = generateExpression(expr.object);
    
    // Special handling for Date methods
    if (expr.method === 'toISOString' && isDateExpression(expr.object)) {
      return 'LocalDateTime.now()';
    }
    
    // Special handling for mapper methods that need null when no wrapper
    const mapperMethodsNeedingNull = ['selectList', 'selectCount', 'delete'];
    if (mapperMethodsNeedingNull.includes(methodName) && args === '') {
      return `${obj}.${methodName}(null)`;
    }
    
    return `${obj}.${methodName}(${args})`;
  }
  
  // Handle special standalone methods
  if (expr.method === 'console.log') {
    return `System.out.println(${args})`;
  }
  
  // Handle validateDto - skip in Java (handled by @Valid)
  // Return a mock object with success=true to skip validation logic
  if (expr.method === 'validateDto') {
    return `new Object() { public boolean success = true; }`;
  }
  
  // Handle Number() conversion
  if (expr.method === 'Number') {
    return `Integer.valueOf(${args})`;
  }
  
  return `${methodName}(${args})`;
}

/**
 * Check if expression is a Date expression
 */
function isDateExpression(expr: ParsedExpression): boolean {
  if (expr.type === 'new') {
    return (expr as ParsedNewExpression).className === 'Date';
  }
  return false;
}

/**
 * Translate method name from TS to Java conventions
 */
function translateMethodName(name: string): string {
  // Special method translations
  const methodMap: Record<string, string> = {
    'toString': 'toString',
    'toFixed': 'toString',
    'push': 'add',
    'pop': 'removeLast',
    'shift': 'removeFirst',
    'includes': 'contains',
    'indexOf': 'indexOf',
    'length': 'size()',
    'map': 'stream().map',
    'filter': 'stream().filter',
    'find': 'stream().findFirst',
    'some': 'stream().anyMatch',
    'every': 'stream().allMatch',
    'forEach': 'forEach',
    'toISOString': 'toString',
    // MyBatis-Plus API mappings
    'selectListByWrapper': 'selectList',
    'selectCountByWrapper': 'selectCount',
    'updateWithWrapper': 'update',
    'deleteByWrapper': 'delete',
  };
  
  return methodMap[name] || name;
}

/**
 * Generate binary expression
 */
function generateBinaryExpression(expr: ParsedBinaryExpression): string {
  // Handle operator translations
  let operator = expr.operator;
  
  // Handle assignment to property: obj.prop = value -> obj.setProp(value)
  if (operator === '=') {
    if (expr.left.type === 'propertyAccess') {
      const propAccess = expr.left as any;
      const obj = generateExpression(propAccess.object);
      const prop = propAccess.property;
      const value = generateExpression(expr.right);
      
      // If assigning to 'this', it's internal field access
      if (propAccess.object.type === 'identifier' && propAccess.object.name === 'this') {
        return `this.${prop} = ${value}`;
      }
      
      // Convert to setter: obj.prop = value -> obj.setProp(value)
      const capitalizedProp = prop.charAt(0).toUpperCase() + prop.slice(1);
      return `${obj}.set${capitalizedProp}(${value})`;
    }
    // Normal assignment
    const left = generateExpression(expr.left);
    const right = generateExpression(expr.right);
    return `${left} = ${right}`;
  }
  
  const left = generateExpression(expr.left);
  const right = generateExpression(expr.right);
  
  // Handle comparison with undefined -> null
  const rightExpr = expr.right;
  const isNullComparison = 
    (rightExpr.type === 'identifier' && (rightExpr as any).name === 'undefined') ||
    (rightExpr.type === 'literal' && (rightExpr as any).literalType === 'null');
  
  // === and !== become == null or != null, or Objects.equals
  if (operator === '===' || operator === '==') {
    if (isNullComparison) {
      return `${left} == null`;
    }
    // For primitives, use ==, for objects use Objects.equals()
    return `Objects.equals(${left}, ${right})`;
  }
  if (operator === '!==' || operator === '!=') {
    if (isNullComparison) {
      return `${left} != null`;
    }
    return `!Objects.equals(${left}, ${right})`;
  }
  
  // Logical AND/OR
  if (operator === '&&') {
    return `${left} && ${right}`;
  }
  if (operator === '||') {
    return `${left} || ${right}`;
  }
  
  return `${left} ${operator} ${right}`;
}

/**
 * Generate new expression
 */
function generateNewExpression(expr: ParsedNewExpression): string {
  // Handle Date -> LocalDateTime
  if (expr.className === 'Date') {
    return 'LocalDateTime.now()';
  }
  
  const args = expr.arguments.map(generateExpression).join(', ');
  const typeArgs = expr.typeArguments ? `<${expr.typeArguments.map(mapType).join(', ')}>` : '';
  return `new ${expr.className}${typeArgs}(${args})`;
}

/**
 * Generate conditional (ternary) expression
 * TypeScript: condition ? trueExpr : falseExpr
 * Java: condition ? trueExpr : falseExpr
 */
function generateConditionalExpression(expr: ParsedConditionalExpression): string {
  const condition = generateConditionExpression(expr.condition);
  const whenTrue = generateExpression(expr.whenTrue);
  const whenFalse = generateExpression(expr.whenFalse);
  return `${condition} ? ${whenTrue} : ${whenFalse}`;
}

/**
 * Generate element access expression
 * TypeScript: arr[0], obj['key']
 * Java: arr.get(0), obj.get("key")
 */
function generateElementAccessExpression(expr: ParsedElementAccessExpression): string {
  const obj = generateExpression(expr.object);
  const index = generateExpression(expr.index);
  // For numeric index, use .get(index)
  // For string index, it's like a property access
  return `${obj}.get(${index})`;
}

/**
 * Generate object literal (converts to Java Map or Entity)
 */
function generateObjectLiteral(expr: { properties: { key: string; value: ParsedExpression }[] }): string {
  if (expr.properties.length === 0) {
    return 'new HashMap<>()';
  }
  
  // For simple objects, use Map.of() or inline construction
  const entries = expr.properties.map(p => {
    let value = generateExpression(p.value);
    // Clean up any TypeScript syntax in values
    value = cleanRawCode(value);
    return `"${p.key}", ${value}`;
  }).join(', ');
  
  return `Map.of(${entries})`;
}

/**
 * Map TypeScript type to Java type
 */
function mapType(tsType: string): string {
  // Handle nullable types
  if (tsType.endsWith(' | null') || tsType.endsWith(' | undefined')) {
    tsType = tsType.replace(/ \| (null|undefined)/g, '');
  }

  // Handle Omit, Pick, Partial generic types -> generate appropriate class name
  const utilityMatch = tsType.match(/^(Omit|Pick|Partial|Required)<([^,>]+)(?:,\s*(['"][^'"]+['"](?:\s*\|\s*['"][^'"]+['"])*))?>/);
  if (utilityMatch) {
    const [fullMatch, utility, baseType, fieldsStr] = utilityMatch;
    const fields = fieldsStr 
      ? fieldsStr.split('|').map(f => f.trim().replace(/['"]/g, ''))
      : [];
    
    // Generate class name
    let generatedClassName: string;
    if (utility === 'Omit') {
      const fieldNames = fields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('');
      generatedClassName = `${baseType.trim()}Without${fieldNames}`;
    } else if (utility === 'Pick') {
      const fieldNames = fields.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join('');
      generatedClassName = `${baseType.trim()}${fieldNames}Only`;
    } else if (utility === 'Partial') {
      generatedClassName = `${baseType.trim()}Partial`;
    } else {
      generatedClassName = baseType.trim();
    }
    
    // Register to shared utility type usages for class generation
    registerUtilityTypeUsage(
      fullMatch,
      utility as 'Omit' | 'Pick' | 'Partial' | 'Required',
      baseType.trim(),
      fields,
      generatedClassName
    );
    
    return generatedClassName;
  }

  // Handle arrays
  if (tsType.endsWith('[]')) {
    const elementType = tsType.slice(0, -2);
    return `List<${mapType(elementType)}>`;
  }
  
  // Handle generics like QueryWrapper<User>
  const genericMatch = tsType.match(/^(\w+)<(.+)>$/);
  if (genericMatch) {
    const [, base, typeParam] = genericMatch;
    return `${base}<${mapType(typeParam)}>`;
  }

  // Direct mapping
  if (TYPE_MAPPING[tsType]) {
    return TYPE_MAPPING[tsType];
  }

  // Keep class names as-is
  return tsType;
}
