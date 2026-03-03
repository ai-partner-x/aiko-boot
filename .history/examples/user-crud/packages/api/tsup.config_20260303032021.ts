import { defineConfig } from 'tsup';
import * as ts from 'typescript';
import * as fs from 'fs';
import * as path from 'path';

// ==================== Codegen 逻辑 ====================

function generateApiClient(srcDir: string, outDir: string) {
  if (!fs.existsSync(srcDir)) return;
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const exports: string[] = [];
  let entityFile = '';
  let dtoFile = '';

  // 生成 Entity
  const entityDir = path.join(srcDir, 'entity');
  if (fs.existsSync(entityDir)) {
    for (const file of fs.readdirSync(entityDir)) {
      if (file.endsWith('.entity.ts')) {
        const code = generateInterface(path.join(entityDir, file), 'entity');
        fs.writeFileSync(path.join(outDir, file), code);
        exports.push(`export * from './${file.replace('.ts', '')}';`);
        entityFile = file;
      }
    }
  }

  // 生成 DTO
  const dtoDir = path.join(srcDir, 'dto');
  if (fs.existsSync(dtoDir)) {
    for (const file of fs.readdirSync(dtoDir)) {
      if (file.endsWith('.dto.ts')) {
        const code = generateInterface(path.join(dtoDir, file), 'dto');
        fs.writeFileSync(path.join(outDir, file), code);
        exports.push(`export * from './${file.replace('.ts', '')}';`);
        dtoFile = file;
      }
    }
  }

  // 生成 Controller -> Api
  const controllerDir = path.join(srcDir, 'controller');
  if (fs.existsSync(controllerDir)) {
    for (const file of fs.readdirSync(controllerDir)) {
      if (file.endsWith('.controller.ts')) {
        const info = parseController(path.join(controllerDir, file));
        if (info) {
          const destFile = file.replace('.controller.ts', '.api.ts');
          const code = generateControllerCode(info, entityFile, dtoFile);
          fs.writeFileSync(path.join(outDir, destFile), code);
          exports.push(`export * from './${destFile.replace('.ts', '')}';`);
        }
      }
    }
  }

  // 生成 index.ts
  const indexContent = `/**\n * API Client 入口\n * ⚠️ 此文件由 build 自动生成\n */\n\n${exports.join('\n')}\n`;
  fs.writeFileSync(path.join(outDir, 'index.ts'), indexContent);

  console.log('✅ API Client generated');
}

function generateInterface(filePath: string, type: 'entity' | 'dto'): string {
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
      result.push(`export interface ${className} {\n${properties.join('\n')}\n}`);
    }
  });

  return `/**\n * ⚠️ 此文件由 build 自动生成\n * 源文件: src/${type}/${path.basename(filePath)}\n */\n${result.join('\n')}\n`;
}

interface MethodMeta {
  name: string;
  httpMethod: string;
  path: string;
  params: { name: string; type: string; decorator: string; decoratorArg?: string }[];
  returnType: string;
  innerType: string;
}

interface ControllerInfo {
  className: string;
  basePath: string;
  methods: MethodMeta[];
  imports: Set<string>;
}

function parseController(filePath: string): ControllerInfo | null {
  const sourceCode = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, sourceCode, ts.ScriptTarget.Latest, true);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  let basePath = '/';
  let className = '';
  const methods: MethodMeta[] = [];
  const imports = new Set<string>();

  ts.forEachChild(sourceFile, (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      className = node.name.text.replace('Controller', 'Api');

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
                if (ts.isStringLiteral(pathArg)) methodPath = pathArg.text;
              }
            }
          }

          const params: MethodMeta['params'] = [];
          member.parameters.forEach((param) => {
            const paramName = (param.name as ts.Identifier).text;
            const paramType = param.type
              ? printer.printNode(ts.EmitHint.Unspecified, param.type, sourceFile)
              : 'any';

            if (param.type) {
              const typeText = paramType.replace(/\[\]$/, '');
              if (/^[A-Z]/.test(typeText) && !['Promise', 'Record', 'Array'].includes(typeText)) {
                imports.add(typeText);
              }
            }

            let decorator = '';
            let decoratorArg = '';
            const paramDecorators = ts.getDecorators(param) || [];
            for (const pd of paramDecorators) {
              if (ts.isCallExpression(pd.expression)) {
                decorator = (pd.expression.expression as ts.Identifier).text;
                if (pd.expression.arguments.length > 0) {
                  const arg = pd.expression.arguments[0];
                  if (ts.isStringLiteral(arg)) decoratorArg = arg.text;
                }
              }
            }

            params.push({ name: paramName, type: paramType, decorator, decoratorArg });
          });

          const returnType = member.type
            ? printer.printNode(ts.EmitHint.Unspecified, member.type, sourceFile)
            : 'Promise<any>';

          let innerType = 'any';
          if (member.type && ts.isTypeReferenceNode(member.type)) {
            const typeArgs = member.type.typeArguments;
            if (typeArgs && typeArgs.length > 0) {
              innerType = printer.printNode(ts.EmitHint.Unspecified, typeArgs[0], sourceFile);
              const cleanType = innerType.replace(/\[\]$/, '').replace(/ \| null$/, '');
              if (/^[A-Z]/.test(cleanType) && !['Promise', 'Record', 'Array'].includes(cleanType)) {
                imports.add(cleanType);
              }
            }
          }

          methods.push({ name: methodName, httpMethod, path: methodPath, params, returnType, innerType });
        }
      });
    }
  });

  if (!className) return null;
  return { className, basePath, methods, imports };
}

function generateControllerCode(info: ControllerInfo, entityFile: string, dtoFile: string): string {
  const methodsCode = info.methods.map((m) => {
    const paramsStr = m.params.map((p) => `${p.name}: ${p.type}`).join(', ');
    let urlCode = `\`\${this.baseUrl}/api${info.basePath}${m.path}\``;

    for (const p of m.params) {
      if (p.decorator === 'PathVariable' && p.decoratorArg) {
        urlCode = urlCode.replace(`:${p.decoratorArg}`, `\${${p.name}}`);
      }
    }

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

  const entityImports: string[] = [];
  const dtoImports: string[] = [];

  info.imports.forEach((type) => {
    if (type.endsWith('Dto')) dtoImports.push(type);
    else entityImports.push(type);
  });

  let importStatements = '/**\n * ⚠️ 此文件由 build 自动生成\n */\n';
  if (entityImports.length > 0) {
    importStatements += `import type { ${entityImports.join(', ')} } from './${entityFile.replace('.ts', '')}';\n`;
  }
  if (dtoImports.length > 0) {
    importStatements += `import type { ${dtoImports.join(', ')} } from './${dtoFile.replace('.ts', '')}';\n`;
  }

  return `${importStatements}
export class ${info.className} {
  constructor(private baseUrl: string) {}

${methodsCode}
}
`;
}

// ==================== tsup 配置 ====================

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  onSuccess: async () => {
    generateApiClient('./src', './dist/client');
  },
});
