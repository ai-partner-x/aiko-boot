/**
 * TypeScript Transformer - 自动填充装饰器泛型参数
 * 
 * 在构建时自动将 @Mapper() + extends BaseMapper<User> 
 * 转换为 @Mapper(User) + extends BaseMapper<User>
 * 
 * 开发时简洁，运行时保留完整类型信息
 */
import ts from 'typescript';

/**
 * 装饰器名称与基类的映射关系
 * key: 装饰器名称
 * value: 对应的基类名称（从该基类的泛型参数提取类型）
 */
const DECORATOR_BASE_CLASS_MAP: Record<string, string> = {
  'Mapper': 'BaseMapper',
};

/**
 * 创建装饰器泛型参数填充 Transformer
 * 
 * @example
 * // 输入
 * @Mapper()
 * export class UserMapper extends BaseMapper<User> {}
 * 
 * // 输出
 * @Mapper(User)
 * export class UserMapper extends BaseMapper<User> {}
 */
export function createDecoratorGenericTransformer(): ts.TransformerFactory<ts.SourceFile> {
  return (context: ts.TransformationContext) => {
    return (sourceFile: ts.SourceFile) => {
      const visitor = (node: ts.Node): ts.Node => {
        // 只处理类声明
        if (!ts.isClassDeclaration(node)) {
          return ts.visitEachChild(node, visitor, context);
        }

        const classDecl = node;
        if (!classDecl.modifiers) {
          return ts.visitEachChild(node, visitor, context);
        }

        // 获取所有装饰器
        const decorators = ts.getDecorators(classDecl);
        if (!decorators || decorators.length === 0) {
          return ts.visitEachChild(node, visitor, context);
        }

        // 检查是否有继承
        const heritageClause = classDecl.heritageClauses?.find(
          h => h.token === ts.SyntaxKind.ExtendsKeyword
        );
        if (!heritageClause || heritageClause.types.length === 0) {
          return ts.visitEachChild(node, visitor, context);
        }

        const baseType = heritageClause.types[0];
        const baseTypeName = getTypeName(baseType.expression);
        const typeArgs = baseType.typeArguments;

        // 处理每个装饰器
        let hasModification = false;
        const newModifiers = classDecl.modifiers?.map(modifier => {
          if (!ts.isDecorator(modifier)) {
            return modifier;
          }

          const decorator = modifier;
          const decoratorName = getDecoratorName(decorator);
          const expectedBaseClass = DECORATOR_BASE_CLASS_MAP[decoratorName];

          // 检查是否匹配装饰器-基类对
          if (!expectedBaseClass || baseTypeName !== expectedBaseClass) {
            return decorator;
          }

          // 检查装饰器是否已经有参数
          if (hasDecoratorArguments(decorator)) {
            return decorator;
          }

          // 从基类泛型中提取类型参数
          if (!typeArgs || typeArgs.length === 0) {
            return decorator;
          }

          const entityType = typeArgs[0];
          if (!ts.isTypeReferenceNode(entityType)) {
            return decorator;
          }

          const entityName = getTypeName(entityType.typeName);
          if (!entityName) {
            return decorator;
          }

          // 创建新的装饰器调用，带上 Entity 参数
          hasModification = true;
          const entityIdentifier = context.factory.createIdentifier(entityName);
          const newCall = context.factory.createCallExpression(
            getDecoratorExpression(decorator),
            undefined,
            [entityIdentifier]
          );

          return context.factory.createDecorator(newCall);
        });

        if (!hasModification) {
          return ts.visitEachChild(node, visitor, context);
        }

        // 创建新的类声明
        return context.factory.updateClassDeclaration(
          classDecl,
          newModifiers,
          classDecl.name,
          classDecl.typeParameters,
          classDecl.heritageClauses,
          classDecl.members
        );
      };

      return ts.visitNode(sourceFile, visitor) as ts.SourceFile;
    };
  };
}

/**
 * 获取类型名称
 */
function getTypeName(node: ts.Node): string | undefined {
  if (ts.isIdentifier(node)) {
    return node.text;
  }
  if (ts.isPropertyAccessExpression(node)) {
    return node.name.text;
  }
  return undefined;
}

/**
 * 获取装饰器名称
 */
function getDecoratorName(decorator: ts.Decorator): string {
  const expr = decorator.expression;
  
  // @Mapper 或 @Mapper()
  if (ts.isIdentifier(expr)) {
    return expr.text;
  }
  
  // @Mapper() 形式
  if (ts.isCallExpression(expr)) {
    const callee = expr.expression;
    if (ts.isIdentifier(callee)) {
      return callee.text;
    }
  }
  
  return '';
}

/**
 * 获取装饰器的表达式（用于创建新的调用）
 */
function getDecoratorExpression(decorator: ts.Decorator): ts.Expression {
  const expr = decorator.expression;
  
  if (ts.isCallExpression(expr)) {
    return expr.expression;
  }
  
  return expr;
}

/**
 * 检查装饰器是否已经有参数
 */
function hasDecoratorArguments(decorator: ts.Decorator): boolean {
  const expr = decorator.expression;
  
  if (ts.isCallExpression(expr)) {
    return expr.arguments.length > 0;
  }
  
  // @Mapper 形式（无括号）等同于无参数
  return false;
}

/**
 * 使用 Transformer 转换源代码
 */
export function transformSourceCode(sourceCode: string, fileName = 'input.ts'): string {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.ESNext,
    true,
    ts.ScriptKind.TS
  );

  const result = ts.transform(sourceFile, [createDecoratorGenericTransformer()]);
  const transformedSourceFile = result.transformed[0];

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const output = printer.printFile(transformedSourceFile);

  result.dispose();
  return output;
}

export default createDecoratorGenericTransformer;
