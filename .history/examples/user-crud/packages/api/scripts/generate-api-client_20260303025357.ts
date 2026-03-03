/**
 * 从源码生成前端可用的 API Client
 *
 * 方案 B：直接生成带 fetch 实现的类，无需运行时元数据
 *
 * 生成：
 *   - user.api.ts (带完整 fetch 实现的 API 客户端)
 *   - user.entity.ts (纯 interface)
 *   - user.dto.ts (纯 interface)
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, '../src');
const CLIENT_DIR = path.join(__dirname, '../dist/client');

// ==================== Controller 生成（带 fetch 实现） ====================

interface MethodMeta {
  name: string;
  httpMethod: string;
  path: string;
  params: { name: string; type: string; decorator: string; decoratorArg?: string }[];
  returnType: string;
  innerType: string; // Promise<T> 中的 T
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
      className = node.name.text.replace('Controller', 'Api');

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

          // 提取 Promise<T> 中的 T
          let innerType = 'any';
          if (member.type && ts.isTypeReferenceNode(member.type)) {
            const typeArgs = member.type.typeArguments;
            if (typeArgs && typeArgs.length > 0) {
              innerType = printer.printNode(ts.EmitHint.Unspecified, typeArgs[0], sourceFile);
            }
          }

          methods.push({ name: methodName, httpMethod, path: methodPath, params, returnType, innerType });
        }
      });
    }
  });

  // 生成带 fetch 实现的方法
  const methodsCode = methods.map((m) => {
    const paramsStr = m.params.map((p) => `${p.name}: ${p.type}`).join(', ');
    
    // 构建 URL
    let urlCode = `\`\${this.baseUrl}/api${basePath}${m.path}\``;
    
    // 替换路径参数
    for (const p of m.params) {
      if (p.decorator === 'PathVariable' && p.decoratorArg) {
        urlCode = urlCode.replace(`:${p.decoratorArg}`, `\${${p.name}}`);
      }
    }

    // 构建 body
    const bodyParam = m.params.find((p) => p.decorator === 'RequestBody');
    const bodyCode = bodyParam ? `body: JSON.stringify(${bodyParam.name}),` : '';

    return `  async ${m.name}(${paramsStr}): ${m.returnType} {
    const res = await fetch(${urlCode}, {
      method: '${m.httpMethod}',
      headers: { 'Content-Type': 'application/json' },
      ${bodyCode}
    });
    const json = await res.json() as { success: boolean; data?: ${m.innerType}; error?: string };
    if (!json.success) throw new Error(json.error || 'Request failed');
    return json.data as ${m.innerType};
  }`;
  }).join('\n\n');

  return `/**
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 * 源文件: src/controller/${path.basename(filePath)}
 */
import type { User } from './user.entity';
import type { CreateUserDto, UpdateUserDto } from './user.dto';

export class ${className} {
  constructor(private baseUrl: string) {}

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

  // 1. 生成 Controller -> Api
  const controllerDir = path.join(SRC_DIR, 'controller');
  if (fs.existsSync(controllerDir)) {
    for (const file of fs.readdirSync(controllerDir)) {
      if (file.endsWith('.controller.ts')) {
        const srcPath = path.join(controllerDir, file);
        const destFile = file.replace('.controller.ts', '.api.ts');
        const destPath = path.join(CLIENT_DIR, destFile);
        const code = generateController(srcPath);
        fs.writeFileSync(destPath, code);
        console.log(`Generated: ${destFile}`);
        exports.push(`export * from './${destFile.replace('.ts', '')}';`);
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

  // 4. 生成 index.ts（简化版，不需要 createApiClientFromMeta）
  const indexContent = `/**
 * API Client 入口
 * ⚠️ 此文件由 build 自动生成，请勿手动修改
 */

${exports.join('\n')}
`;

  fs.writeFileSync(path.join(CLIENT_DIR, 'index.ts'), indexContent);
  console.log('Generated: index.ts');

  console.log('\n✅ API Client generation complete!');
}

main();
