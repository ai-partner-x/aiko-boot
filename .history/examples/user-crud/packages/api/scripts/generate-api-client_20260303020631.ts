/**
 * 从 Controller 生成 API Client
 *
 * 原理：读取 Controller 源码，去掉方法实现和后端依赖，保留装饰器
 *
 * 用法：npx tsx scripts/generate-api-client.ts
 */
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONTROLLER_DIR = path.join(__dirname, '../src/controller');
const CLIENT_DIR = path.join(__dirname, '../dist/client');

// 需要移除的后端专用 import
const BACKEND_IMPORTS = ['Injectable', 'UserService'];

// 需要移除的后端专用装饰器
const BACKEND_DECORATORS = ['Injectable'];

function generateApiClient(controllerPath: string): string {
  const sourceCode = fs.readFileSync(controllerPath, 'utf-8');
  const sourceFile = ts.createSourceFile(
    controllerPath,
    sourceCode,
    ts.ScriptTarget.Latest,
    true
  );

  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const result: string[] = [];

  // 收集需要的 import
  const imports: Set<string> = new Set();
  let hasReflectMetadata = false;

  // 遍历 AST
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = (node.moduleSpecifier as ts.StringLiteral).text;

      // 保留 reflect-metadata
      if (moduleSpecifier === 'reflect-metadata') {
        hasReflectMetadata = true;
        return;
      }

      // 保留 @ai-first/nextjs 的装饰器 import
      if (moduleSpecifier === '@ai-first/nextjs') {
        const importClause = node.importClause;
        if (importClause && importClause.namedBindings && ts.isNamedImports(importClause.namedBindings)) {
          importClause.namedBindings.elements.forEach((element) => {
            const name = element.name.text;
            if (!BACKEND_IMPORTS.includes(name)) {
              imports.add(name);
            }
          });
        }
      }
      // 跳过后端依赖 (service, di 等)
      return;
    }

    if (ts.isClassDeclaration(node) && node.name) {
      const className = node.name.text;
      // Controller -> Api 命名转换
      const apiClassName = className.replace('Controller', 'Api');

      // 处理装饰器 - 过滤掉后端专用的
      const decorators = ts.getDecorators(node) || [];
      const filteredDecorators = decorators.filter((d) => {
        if (ts.isCallExpression(d.expression)) {
          const name = (d.expression.expression as ts.Identifier).text;
          return !BACKEND_DECORATORS.includes(name);
        }
        return true;
      });

      // 处理方法
      const methods: string[] = [];
      node.members.forEach((member) => {
        if (ts.isMethodDeclaration(member) && member.name) {
          const methodName = (member.name as ts.Identifier).text;

          // 收集方法装饰器
          const methodDecorators = ts.getDecorators(member) || [];
          const decoratorStrings = methodDecorators.map((d) =>
            printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
          );

          // 收集参数（包括参数装饰器）
          const params = member.parameters.map((param) => {
            const paramDecorators = ts.getDecorators(param) || [];
            const paramDecoratorStrings = paramDecorators.map((d) =>
              printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
            );
            const paramName = (param.name as ts.Identifier).text;
            const paramType = param.type
              ? printer.printNode(ts.EmitHint.Unspecified, param.type, sourceFile)
              : 'any';
            return `${paramDecoratorStrings.join(' ')} ${paramName}: ${paramType}`;
          });

          // 获取返回类型
          const returnType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'Promise<any>';

          // 生成空方法
          methods.push(`
  ${decoratorStrings.join('\n  ')}
  ${methodName}(${params.join(', ')}): ${returnType} {
    return null!;
  }`);
        }
      });

      // 生成装饰器字符串
      const classDecoratorStrings = filteredDecorators.map((d) =>
        printer.printNode(ts.EmitHint.Unspecified, d, sourceFile)
      );

      result.push(`
${classDecoratorStrings.join('\n')}
export class ${apiClassName} {${methods.join('\n')}
}`);
    }
  });

  // 组装最终代码
  const importStatements = [
    hasReflectMetadata ? "import 'reflect-metadata';" : '',
    imports.size > 0
      ? `import {\n  ${Array.from(imports).join(',\n  ')},\n} from '@ai-first/nextjs';`
      : '',
    "import type { User, CreateUserDto, UpdateUserDto } from '../shared/types';",
  ]
    .filter(Boolean)
    .join('\n');

  const header = `/**
 * ${path.basename(controllerPath).replace('.controller.ts', '')} API Client
 * 
 * ⚠️ 此文件由 scripts/generate-api-client.ts 自动生成
 * 请勿手动修改，修改请编辑对应的 Controller
 *
 * 用法：
 *   import { UserApi } from '@user-crud/api/client';
 *   const userApi = createApiClient(UserApi, { baseUrl: 'http://localhost:3001' });
 *   const users = await userApi.list();
 */`;

  return `${header}\n${importStatements}\n${result.join('\n')}\n`;
}

// 主函数
function main() {
  // 确保 client 目录存在
  if (!fs.existsSync(CLIENT_DIR)) {
    fs.mkdirSync(CLIENT_DIR, { recursive: true });
  }

  // 遍历所有 controller
  const files = fs.readdirSync(CONTROLLER_DIR);
  const generatedFiles: string[] = [];

  for (const file of files) {
    if (file.endsWith('.controller.ts')) {
      const controllerPath = path.join(CONTROLLER_DIR, file);
      const apiFileName = file.replace('.controller.ts', '.api.ts');
      const apiPath = path.join(CLIENT_DIR, apiFileName);

      console.log(`Generating: ${file} -> ${apiFileName}`);

      const apiCode = generateApiClient(controllerPath);
      fs.writeFileSync(apiPath, apiCode);

      generatedFiles.push(apiFileName.replace('.ts', ''));
    }
  }

  // 生成 index.ts
  const indexContent = `/**
 * API Client 入口
 * ⚠️ 此文件由 scripts/generate-api-client.ts 自动生成
 */

// API Clients
${generatedFiles.map((f) => `export * from './${f}';`).join('\n')}

// 共享类型
export * from '../shared/types';

// createApiClient 工具
export { createApiClient } from '@ai-first/nextjs';
`;

  fs.writeFileSync(path.join(CLIENT_DIR, 'index.ts'), indexContent);
  console.log('Generated: index.ts');

  console.log('\n✅ API Client generation complete!');
}

main();
