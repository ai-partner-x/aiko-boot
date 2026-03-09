/**
 * Rule: no-union-types
 * Disallow union types except T | null (not Java-compatible)
 */
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noUnionTypes = createRule({
  name: 'no-union-types',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow union types except T | null (not Java-compatible)',
    },
    messages: {
      noUnionType: 'Union types cannot be translated to Java. Only T | null is allowed (converts to Optional<T>).',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      TSUnionType(node: TSESTree.TSUnionType) {
        const types = node.types;
        
        // Allow T | null or T | undefined (2 types, one is null/undefined)
        if (types.length === 2) {
          const hasNullOrUndefined = types.some(
            t => t.type === 'TSNullKeyword' || t.type === 'TSUndefinedKeyword'
          );
          if (hasNullOrUndefined) {
            return; // This is allowed
          }
        }

        // All other union types are not allowed
        context.report({
          node,
          messageId: 'noUnionType',
        });
      },
    };
  },
});
