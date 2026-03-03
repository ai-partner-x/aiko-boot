/**
 * @ai-first/eslint-plugin
 * ESLint plugin to enforce Java-compatible TypeScript code
 */
import { noArrowMethods } from './rules/no-arrow-methods.js';
import { noDestructuringInMethods } from './rules/no-destructuring-in-methods.js';
import { noObjectSpread } from './rules/no-object-spread.js';
import { staticRoutePaths } from './rules/static-route-paths.js';
import { requireRestController } from './rules/require-rest-controller.js';

const rules = {
  'no-arrow-methods': noArrowMethods,
  'no-destructuring-in-methods': noDestructuringInMethods,
  'no-object-spread': noObjectSpread,
  'static-route-paths': staticRoutePaths,
  'require-rest-controller': requireRestController,
};

const configs = {
  recommended: {
    plugins: ['@ai-first'],
    rules: {
      '@ai-first/no-arrow-methods': 'error',
      '@ai-first/no-destructuring-in-methods': 'error',
      '@ai-first/no-object-spread': 'warn',
      '@ai-first/static-route-paths': 'error',
      '@ai-first/require-rest-controller': 'error',
    },
  },
  strict: {
    plugins: ['@ai-first'],
    rules: {
      '@ai-first/no-arrow-methods': 'error',
      '@ai-first/no-destructuring-in-methods': 'error',
      '@ai-first/no-object-spread': 'error',
      '@ai-first/static-route-paths': 'error',
      '@ai-first/require-rest-controller': 'error',
    },
  },
};

const plugin = {
  meta: {
    name: '@ai-first/eslint-plugin',
    version: '0.1.0',
  },
  rules,
  configs,
};

export default plugin;
export { rules, configs };
