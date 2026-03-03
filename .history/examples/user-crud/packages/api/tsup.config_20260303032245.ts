import { defineConfig } from 'tsup';
import { generateApiClient } from '@ai-first/api-starter/codegen';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  onSuccess: async () => {
    generateApiClient();
  },
});
