/**
 * 从源码生成前端可用的 API Client
 *
 * 原理：读取 Controller/Entity/DTO 源码，去掉后端逻辑和装饰器
 *
 * 生成：
 *   - user.controller.ts (使用纯数据定义，不使用装饰器)
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

// ==================== Controller 生成（纯数据方式） ====================

interface MethodMeta {
  name: string;
  httpMethod: string;
  path: string;
  params: { name: string; type: string; decorator: string; decoratorArg?: string }[];
  returnType: string;
}

function generateController(filePath: string): string {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  let basePath = '/';
  let className = '';
  const methods: MethodMeta[] = [];

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      className = node.name.text;

      // 提取 @RestController 的 path
      const decorators = ts.getDecorators(node) || [];
      for (const d of decorators) {
        if (ts.isCallExpression(d.expression)) {
          const decoratorName = (d.expression.expression as ts.Identifier).text;
          if (decoratorName === 'RestController' && d.expression.arguments.length > 0) {
            const arg = d.expression.arguments[0];
            if (ts.isObjectLiteralExpression(arg)) {
              for (const prop of arg.properties) {
                if (ts.isPropertyAssignment(prop) && (prop.name as ts.Identifier).text === 'path') {
                  basePath = (prop.initializer as ts.StringLiteral).text;
                }
              }
            }
          }
        }
      }

      // 处理方法
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = (member.name as ts.Identifier).text;
          const methodDecorators = ts.getDecorators(member) || [];

          let httpMethod = 'GET';
          let methodPath = '';

          for (const d of methodDecorators) {
            if (ts.isCallExpression(d.expression)) {
              const dName = (d.expression.expression as ts.Identifier).text;
              if (dName === 'GetMapping') httpMethod = 'GET';
              else if (dName === 'PostMapping') httpMethod = 'POST';
              else if (dName === 'PutMapping') httpMethod = 'PUT';
              else if (dName === 'DeleteMapping') httpMethod = 'DELETE';

              if (d.expression.arguments.length > 0) {
                const pathArg = d.expression.arguments[0];
                if (ts.isStringLiteral(pathArg)) {
                  methodPath = pathArg.text;
                }
              }
            }
          }

          // 处理参数
          const params: MethodMeta['params'] = [];
          member.parameters.forEach((param) => {
            const paramName = (param.name as ts.Identifier).text;
            const paramType = param.type
              ? printer.printNode(ts.EmitHint.Unspecified, param.type, sourceFile)
              : 'any';
            const paramDecorators = ts.getDecorators(param) || [];

            let decorator = '';
            let decoratorArg = '';
            for (const pd of paramDecorators) {
              if (ts.isCallExpression(pd.expression)) {
                decorator = (pd.expression.expression as ts.Identifier).text;
                if (pd.expression.arguments.length > 0) {
                  const arg = pd.expression.arguments[0];
                  if (ts.isStringLiteral(arg)) {
                    decoratorArg = arg.text;
                  }
                }
              }
            }

            params.push({ name: paramName, type: paramType, decorator, decoratorArg });
          });

          const returnType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'Promise<any>';

          methods.push({ name: methodName, httpMethod, path: methodPath, params, returnType });
        }
      });
    }
  });

  // 生成纯数据定义的代码
  const methodsCode = methods.map((m) => {
    const paramsStr = m.params.map((p) => `${p.name}: ${p.type}`).join(', ');
    return `  ${m.name}(${paramsStr}): ${m.returnType} { return null!; }`;
  }).join('\n\n');

  const metadataCode = methods.map((m) => {
    const paramsMetaStr = m.params.map((p) => 
      `{ name: '${p.name}', decorator: '${p.decorator}', decoratorArg: '${p.decoratorArg || ''}' }`
    ).join(', ');
    return `  ${m.name}: { method: '${m.httpMethod}', path: '${m.path}', params: [${paramsMetaStr}] }`;
  }).join(',\n');

  return `/**
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 * 源文件: src/controller/${path.basename(filePath)}
 */
import { User } from './user.entity';
import { CreateUserDto, UpdateUserDto } from './user.dto';

// API 元数据（供 createApiClient 使用）
export const ${className}Meta = {
  basePath: '${basePath}',
  methods: {
${metadataCode}
  }
};

// 类型定义
export class ${className} {
${methodsCode}
}
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
export { createApiClientFromMeta, type ApiMetadata } from '@ai-first/nextjs';
`;

  fs.writeFileSync(path.join(CLIENT_DIR, 'index.ts'), indexContent);
  console.log('Generated: index.ts');

  console.log('\n✅ API Client generation complete!');
}

main();
