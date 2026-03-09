/**
 * tsup 插件 - 构建时自动填充装饰器泛型参数
 * 
 * @example
 * // tsup.config.ts
 * import { decoratorGenericPlugin } from '@ai-partner-x/codegen/tsup-plugin';
 * 
 * export default defineConfig({
 *   esbuildPlugins: [decoratorGenericPlugin()],
 * });
 */
import { transformSourceCode } from './transformer.js';

/** esbuild 插件类型 */
interface EsbuildPlugin {
  name: string;
  setup(build: {
    onLoad(
      options: { filter: RegExp },
      callback: (args: { path: string }) => Promise<{ contents: string; loader: string } | undefined>
    ): void;
  }): void;
}

/**
 * 创建 esbuild 插件（可用于 tsup）
 */
export function decoratorGenericPlugin(): EsbuildPlugin {
  return {
    name: 'decorator-generic-transform',
    setup(build) {
      build.onLoad({ filter: /\.(ts|tsx)$/ }, async (args) => {
        const fs = await import('fs/promises');
        const path = await import('path');
        
        // 跳过 node_modules
        if (args.path.includes('node_modules')) {
          return undefined;
        }
        
        const source = await fs.readFile(args.path, 'utf-8');
        
        // 快速检查是否需要转换（包含 @Mapper 且有 BaseMapper）
        if (!source.includes('@Mapper') || !source.includes('BaseMapper')) {
          return undefined;
        }
        
        try {
          const transformed = transformSourceCode(source, args.path);
          return {
            contents: transformed,
            loader: path.extname(args.path).slice(1) as 'ts' | 'tsx',
          };
        } catch (e) {
          // 转换失败时返回原始内容
          console.warn(`[decorator-generic] Transform failed for ${args.path}:`, e);
          return undefined;
        }
      });
    },
  };
}

export default decoratorGenericPlugin;
