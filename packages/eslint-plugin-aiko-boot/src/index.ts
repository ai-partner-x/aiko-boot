/**
 * @aiko-boot/eslint-plugin
 * ESLint plugin to enforce Java-compatible TypeScript code
 */
import { noArrowMethods } from './rules/no-arrow-methods.js';
import { noDestructuringInMethods } from './rules/no-destructuring-in-methods.js';
import { noObjectSpread } from './rules/no-object-spread.js';
import { staticRoutePaths } from './rules/static-route-paths.js';
import { requireRestController } from './rules/require-rest-controller.js';
import { noOptionalChainingInMethods } from './rules/no-optional-chaining-in-methods.js';
import { noNullishCoalescing } from './rules/no-nullish-coalescing.js';
import { explicitReturnType } from './rules/explicit-return-type.js';
import { noUnionTypes } from './rules/no-union-types.js';
import { noInlineObjectTypes } from './rules/no-inline-object-types.js';

const rules = {
  'no-arrow-methods': noArrowMethods,
  'no-destructuring-in-methods': noDestructuringInMethods,
  'no-object-spread': noObjectSpread,
  'static-route-paths': staticRoutePaths,
  'require-rest-controller': requireRestController,
  'no-optional-chaining-in-methods': noOptionalChainingInMethods,
  'no-nullish-coalescing': noNullishCoalescing,
  'explicit-return-type': explicitReturnType,
  'no-union-types': noUnionTypes,
  'no-inline-object-types': noInlineObjectTypes,
};

const configs = {
  recommended: {
    plugins: ['@ai-partner-x/aiko-boot'],
    rules: {
      '@ai-partner-x/aiko-boot/no-arrow-methods': 'error',
      '@ai-partner-x/aiko-boot/no-destructuring-in-methods': 'error',
      '@ai-partner-x/aiko-boot/no-object-spread': 'warn',
      '@ai-partner-x/aiko-boot/static-route-paths': 'error',
      '@ai-partner-x/aiko-boot/require-rest-controller': 'error',
    },
  },
  strict: {
    plugins: ['@ai-partner-x/aiko-boot'],
    rules: {
      '@ai-partner-x/aiko-boot/no-arrow-methods': 'error',
      '@ai-partner-x/aiko-boot/no-destructuring-in-methods': 'error',
      '@ai-partner-x/aiko-boot/no-object-spread': 'error',
      '@ai-partner-x/aiko-boot/static-route-paths': 'error',
      '@ai-partner-x/aiko-boot/require-rest-controller': 'error',
    },
  },
  // Java 兼容配置 - 用于需要转译到 Java 的项目
  'java-compat': {
    plugins: ['@ai-partner-x/aiko-boot'],
    rules: {
      '@ai-partner-x/aiko-boot/no-arrow-methods': 'error',
      '@ai-partner-x/aiko-boot/no-destructuring-in-methods': 'error',
      '@ai-partner-x/aiko-boot/no-object-spread': 'error',
      '@ai-partner-x/aiko-boot/static-route-paths': 'error',
      '@ai-partner-x/aiko-boot/require-rest-controller': 'error',
      '@ai-partner-x/aiko-boot/no-optional-chaining-in-methods': 'error',
      '@ai-partner-x/aiko-boot/no-nullish-coalescing': 'error',
      '@ai-partner-x/aiko-boot/explicit-return-type': 'error',
      '@ai-partner-x/aiko-boot/no-union-types': 'error',
      '@ai-partner-x/aiko-boot/no-inline-object-types': 'error',
    },
  },
};

const plugin = {
  meta: {
    name: '@ai-partner-x/eslint-plugin-aiko-boot',
    version: '0.1.0',
  },
  rules,
  configs,
};

export default plugin;
export { rules, configs };
