/**
 * Rule: no-nullish-coalescing
 * Disallow nullish coalescing operator (??) (not Java-compatible)
 */
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noNullishCoalescing = createRule({
  name: 'no-nullish-coalescing',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow nullish coalescing operator (??) (not Java-compatible)',
    },
    messages: {
      noNullishCoalescing: 'Nullish coalescing operator (??) cannot be translated to Java. Use ternary operator or Optional instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      LogicalExpression(node) {
        if (node.operator === '??') {
          context.report({
            node,
            messageId: 'noNullishCoalescing',
          });
        }
      },
    };
  },
});
