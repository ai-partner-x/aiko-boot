import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/server.ts'],
    format: ['esm'],
    dts: false,
    clean: false,
    external: [/^@ai-partner-x\//, 'reflect-metadata', 'express', 'cors'],
  },
  {
    // Compile app.config.ts → app.config.js into the project root so that
    // production can load it via ConfigLoader.loadAsync(), which expects
    // app.config.js to reside next to app.config.ts.
    entry: { 'app.config': 'app.config.ts' },
    format: ['esm'],
    dts: false,
    clean: false,
    outDir: '.',
    external: [/^@ai-partner-x\//, 'reflect-metadata'],
  },
]);
