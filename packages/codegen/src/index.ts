/**
 * @ai-first/codegen
 * TypeScript to Java code generator
 */
export * from './types.js';
export { parseSourceFile } from './parser.js';
export { generateJavaClass } from './generator.js';

import { parseSourceFile } from './parser.js';
import { generateJavaClass } from './generator.js';
import type { TranspilerOptions } from './types.js';

/**
 * Transpile TypeScript source code to Java
 */
export function transpile(
  sourceCode: string,
  options: TranspilerOptions
): Map<string, string> {
  const classes = parseSourceFile(sourceCode);
  const result = new Map<string, string>();

  classes.forEach(cls => {
    const javaCode = generateJavaClass(cls, options);
    result.set(`${cls.name}.java`, javaCode);
  });

  return result;
}
