/**
 * tsx/ts-node Loader - 开发时自动转换装饰器泛型参数
 * 
 * @example
 * // package.json
 * "scripts": {
 *   "dev": "tsx watch --import @ai-partner-x/codegen/register src/server.ts"
 * }
 */
import { transformSourceCode } from './transformer.js';

/**
 * ESM Loader - load hook
 */
export async function load(
  url: string,
  context: { format?: string },
  nextLoad: (url: string, context: { format?: string }) => Promise<{ source: string | Buffer; format: string }>
): Promise<{ source: string; format: string; shortCircuit?: boolean }> {
  // 只处理 TypeScript 文件
  if (!url.endsWith('.ts') && !url.endsWith('.tsx')) {
    return nextLoad(url, context) as Promise<{ source: string; format: string }>;
  }
  
  // 跳过 node_modules
  if (url.includes('node_modules')) {
    return nextLoad(url, context) as Promise<{ source: string; format: string }>;
  }
  
  const result = await nextLoad(url, context);
  const source = typeof result.source === 'string' 
    ? result.source 
    : result.source.toString('utf-8');
  
  // 快速检查是否需要转换
  if (!source.includes('@Mapper') || !source.includes('BaseMapper')) {
    return result as { source: string; format: string };
  }
  
  try {
    const transformed = transformSourceCode(source, url);
    return {
      source: transformed,
      format: result.format,
      shortCircuit: true,
    };
  } catch (e) {
    // 转换失败时返回原始内容
    console.warn(`[decorator-generic] Transform failed for ${url}:`, e);
    return result as { source: string; format: string };
  }
}
