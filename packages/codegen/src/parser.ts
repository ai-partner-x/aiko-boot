/**
 * TypeScript AST Parser
 * Parses TypeScript source files and extracts class information
 */
import ts from 'typescript';
import type { ParsedClass, ParsedDecorator, ParsedField, ParsedMethod, ParsedParameter, ParsedConstructor } from './types.js';

/**
 * Parse a TypeScript source file
 */
export function parseSourceFile(sourceCode: string, fileName: string = 'source.ts'): ParsedClass[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    sourceCode,
    ts.ScriptTarget.ES2022,
    true
  );

  const classes: ParsedClass[] = [];

  function visit(node: ts.Node) {
    if (ts.isClassDeclaration(node) && node.name) {
      classes.push(parseClass(node, sourceFile));
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return classes;
}

/**
 * Parse a class declaration
 */
function parseClass(node: ts.ClassDeclaration, sourceFile: ts.SourceFile): ParsedClass {
  const name = node.name?.getText(sourceFile) || 'UnnamedClass';
  const decorators = parseDecorators(node, sourceFile);
  const fields: ParsedField[] = [];
  const methods: ParsedMethod[] = [];
  let constructor: ParsedConstructor | undefined;

  node.members.forEach(member => {
    if (ts.isPropertyDeclaration(member)) {
      fields.push(parseField(member, sourceFile));
    } else if (ts.isMethodDeclaration(member)) {
      methods.push(parseMethod(member, sourceFile));
    } else if (ts.isConstructorDeclaration(member)) {
      constructor = parseConstructor(member, sourceFile);
    }
  });

  return { name, decorators, fields, methods, constructor };
}

/**
 * Parse decorators from a node
 */
function parseDecorators(node: ts.HasDecorators, sourceFile: ts.SourceFile): ParsedDecorator[] {
  const decorators: ParsedDecorator[] = [];
  const nodeDecorators = ts.getDecorators(node);
  
  if (!nodeDecorators) return decorators;

  nodeDecorators.forEach(decorator => {
    const expression = decorator.expression;
    
    if (ts.isCallExpression(expression)) {
      const name = expression.expression.getText(sourceFile);
      const args = parseDecoratorArgs(expression, sourceFile);
      decorators.push({ name, args });
    } else if (ts.isIdentifier(expression)) {
      decorators.push({ name: expression.getText(sourceFile), args: {} });
    }
  });

  return decorators;
}

/**
 * Parse decorator arguments
 */
function parseDecoratorArgs(call: ts.CallExpression, sourceFile: ts.SourceFile): Record<string, any> {
  const args: Record<string, any> = {};
  
  call.arguments.forEach((arg, index) => {
    if (ts.isObjectLiteralExpression(arg)) {
      arg.properties.forEach(prop => {
        if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name)) {
          const key = prop.name.getText(sourceFile);
          const value = parseValue(prop.initializer, sourceFile);
          args[key] = value;
        }
      });
    } else if (ts.isStringLiteral(arg)) {
      args[`arg${index}`] = arg.text;
    } else {
      args[`arg${index}`] = arg.getText(sourceFile);
    }
  });

  return args;
}

/**
 * Parse a value node
 */
function parseValue(node: ts.Expression, sourceFile: ts.SourceFile): any {
  if (ts.isStringLiteral(node)) {
    return node.text;
  } else if (ts.isNumericLiteral(node)) {
    return Number(node.text);
  } else if (node.kind === ts.SyntaxKind.TrueKeyword) {
    return true;
  } else if (node.kind === ts.SyntaxKind.FalseKeyword) {
    return false;
  }
  return node.getText(sourceFile);
}

/**
 * Parse a field (property declaration)
 */
function parseField(node: ts.PropertyDeclaration, sourceFile: ts.SourceFile): ParsedField {
  const name = node.name.getText(sourceFile);
  const type = node.type ? node.type.getText(sourceFile) : 'any';
  const decorators = parseDecorators(node, sourceFile);
  const optional = !!node.questionToken;

  return { name, type, decorators, optional };
}

/**
 * Parse a method declaration
 */
function parseMethod(node: ts.MethodDeclaration, sourceFile: ts.SourceFile): ParsedMethod {
  const name = node.name.getText(sourceFile);
  let returnType = 'void';
  
  if (node.type) {
    returnType = node.type.getText(sourceFile);
    // Remove Promise wrapper
    if (returnType.startsWith('Promise<')) {
      returnType = returnType.slice(8, -1);
    }
  }

  const decorators = parseDecorators(node, sourceFile);
  const parameters = node.parameters.map(p => parseParameter(p, sourceFile));
  const isAsync = !!node.modifiers?.some(m => m.kind === ts.SyntaxKind.AsyncKeyword);

  return { name, returnType, parameters, decorators, isAsync };
}

/**
 * Parse a parameter
 */
function parseParameter(node: ts.ParameterDeclaration, sourceFile: ts.SourceFile): ParsedParameter {
  const name = node.name.getText(sourceFile);
  const type = node.type ? node.type.getText(sourceFile) : 'any';
  const decorators = parseDecorators(node, sourceFile);

  return { name, type, decorators };
}

/**
 * Parse a constructor
 */
function parseConstructor(node: ts.ConstructorDeclaration, sourceFile: ts.SourceFile): ParsedConstructor {
  const parameters = node.parameters.map(p => parseParameter(p, sourceFile));
  return { parameters };
}
