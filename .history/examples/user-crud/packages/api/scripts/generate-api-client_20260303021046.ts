/**
 * 从源码生成前端可用的 API Client
 *
 * 原理：读取 Controller/Entity/DTO 源码，去掉后端逻辑和装饰器
 *
 * 生成：
 *   - user.controller.ts (保留路由装饰器，去掉方法实现)
 *   - user.entity.ts (去掉 ORM 装饰器，保留纯类型)
 *   - user.dto.ts (去掉验证装饰器，保留纯类型)
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const CLIENT_DIR = path.join(__dirname, '../dist/client');

// 后端专用装饰器（需要移除）
const BACKEND_DECORATORS = ['Injectable', 'Entity', 'TableId', 'TableField', 'IsNotEmpty', 'IsEmail', 'IsOptional', 'Length', 'Min', 'Max', 'IsInt'];

// 后端专用 imports（需要移除）
const BACKEND_MODULES = ['@ai-first/di/server', '@ai-first/orm', '@ai-first/validation'];

// ==================== Controller 生成 ====================

function generateController(filePath: string): string {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const imports: Set<string> = new Set();
  let hasReflectMetadata = false;
  const result: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

      if (moduleSpecifier === 'reflect-metadata') {
        hasReflectMetadata = true;
        return;
      }

      // 保留 @ai-first/nextjs 的装饰器
      if (moduleSpecifier === '@ai-first/nextjs') {
        const importClause = node.importClause;
        if (importClause?.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          importClause.namedBindings.elements.forEach((el) => {
            imports.add(el.name.text);
          });
        }
      }
      return;
    }

    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;

      // 过滤装饰器
      const decorators = (ts.getDecorators(node) || []).filter((d) => {
        if (ts.isCallExpression(d.expression)) {
          const name = (d.expression.expression as ts.Identifier).text;
          return !BACKEND_DECORATORS.includes(name);
        }
        return true;
      });

      const decoratorStrings = decorators.map((d) =>
        printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
      );

      // 处理方法
      const methods: string[] = [];
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = (member.name as ts.Identifier).text;
          const methodDecorators = ts.getDecorators(member) || [];
          const methodDecoratorStrings = methodDecorators.map((d) =>
            printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
          );

          const params = member.parameters.map((param) => {
            const paramDecorators = ts.getDecorators(param) || [];
            const paramDecoratorStrings = paramDecorators.map((d) =>
              printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
            );
            const paramName = (param.name as ts.Identifier).text;
            const paramType = param.type
              ? printer.printNode(ts.EmitHint.Unspecified, param.type, sourceFile)
              : 'any';
            return `${paramDecoratorStrings.join(' ')} ${paramName}: ${paramType}`.trim();
          });

          const returnType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'Promise<any>';

          methods.push(`
  ${methodDecoratorStrings.join('\n  ')}
  ${methodName}(${params.join(', ')}): ${returnType} {
    return null!;
  }`);
        }
      });

      result.push(`
${decoratorStrings.join('\n')}
export class ${className} {${methods.join('\n')}
}`);
    }
  });

  // 组装
  const importStatements = [
    hasReflectMetadata ? "import 'reflect-metadata';" : '',
    imports.size > 0
      ? `import {\n  ${Array.from(imports).join(',\n  ')},\n} from '@ai-first/nextjs';`
      : '',
    "import { User } from './user.entity';",
    "import { CreateUserDto, UpdateUserDto } from './user.dto';",
  ].filter(Boolean).join('\n');

  return `/**
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 * 源文件: src/controller/${path.basename(filePath)}
 */
${importStatements}
${result.join('\n')}
`;
}

// ==================== Entity 生成 ====================

function generateEntity(filePath: string): string {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;

      // 收集属性（去掉装饰器）
      const properties: string[] = [];
      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member) && member.name) {
          const propName = (member.name as ts.Identifier).text;
          const propType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'any';
          const optional = member.questionToken ? '?' : '';
          // interface 不需要 ! 符号
          properties.push(`  ${propName}${optional}: ${propType};`);
        }
      });

      result.push(`export interface ${className} {
${properties.join('\n')}
}`);
    }
  });

  return `/**
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 * 源文件: src/entity/${path.basename(filePath)}
 */
${result.join('\n')}
`;
}

// ==================== DTO 生成 ====================

function generateDto(filePath: string): string {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  const result: string[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;

      // 收集属性（去掉装饰器）
      const properties: string[] = [];
      node.members.forEach((member) => {
        if (ts.isPropertyDeclaration(member) && member.name) {
          const propName = (member.name as ts.Identifier).text;
          const propType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'any';
          const optional = member.questionToken ? '?' : '';
          properties.push(`  ${propName}${optional}: ${propType};`);
        }
      });

      result.push(`export interface ${className} {
${properties.join('\n')}
}`);
    }
  });

  return `/**
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 * 源文件: src/dto/${path.basename(filePath)}
 */
${result.join('\n')}
`;
}

// ==================== 主函数 ====================

function main() {
  // 确保目录存在
  if (!fs.existsSync(CLIENT_DIR)) {
    fs.mkdirSync(CLIENT_DIR, { recursive: true });
  }

  const exports: string[] = [];

  // 1. 生成 Controller
  const controllerDir = path.join(SRC_DIR, 'controller');
  if (fs.existsSync(controllerDir)) {
    for (const file of fs.readdirSync(controllerDir)) {
      if (file.endsWith('.controller.ts')) {
        const srcPath = path.join(controllerDir, file);
        const destPath = path.join(CLIENT_DIR, file);
        const code = generateController(srcPath);
        fs.writeFileSync(destPath, code);
        console.log(`Generated: ${file}`);
        exports.push(`export * from './${file.replace('.ts', '')}';`);
      }
    }
  }

  // 2. 生成 Entity
  const entityDir = path.join(SRC_DIR, 'entity');
  if (fs.existsSync(entityDir)) {
    for (const file of fs.readdirSync(entityDir)) {
      if (file.endsWith('.entity.ts')) {
        const srcPath = path.join(entityDir, file);
        const destPath = path.join(CLIENT_DIR, file);
        const code = generateEntity(srcPath);
        fs.writeFileSync(destPath, code);
        console.log(`Generated: ${file}`);
        exports.push(`export * from './${file.replace('.ts', '')}';`);
      }
    }
  }

  // 3. 生成 DTO
  const dtoDir = path.join(SRC_DIR, 'dto');
  if (fs.existsSync(dtoDir)) {
    for (const file of fs.readdirSync(dtoDir)) {
      if (file.endsWith('.dto.ts')) {
        const srcPath = path.join(dtoDir, file);
        const destPath = path.join(CLIENT_DIR, file);
        const code = generateDto(srcPath);
        fs.writeFileSync(destPath, code);
        console.log(`Generated: ${file}`);
        exports.push(`export * from './${file.replace('.ts', '')}';`);
      }
    }
  }

  // 4. 生成 index.ts
  const indexContent = `/**
 * API Client 入口
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 */

${exports.join('\n')}

// createApiClient 工具
export { createApiClient } from '@ai-first/nextjs';
`;

  fs.writeFileSync(path.join(CLIENT_DIR, 'index.ts'), indexContent);
  console.log('Generated: index.ts');

  console.log('\n✅ API Client generation complete!');
}

main();
