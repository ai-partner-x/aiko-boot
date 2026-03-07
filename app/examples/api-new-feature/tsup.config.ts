import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  dts: false,
  clean: true,
  external: [/^@ai-first\//, 'reflect-metadata', 'express', 'cors'],
});
