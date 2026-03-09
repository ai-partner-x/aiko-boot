import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/client-lite.ts', 'src/express-router.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  splitting: false,
  treeshake: true,
  external: ['express'],
});
