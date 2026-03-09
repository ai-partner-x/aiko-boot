/**
 * Rule: no-arrow-methods
 * Disallow arrow functions as class methods (not Java-compatible)
 */
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noArrowMethods = createRule({
  name: 'no-arrow-methods',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow arrow functions as class methods (not Java-compatible)',
    },
    messages: {
      noArrowMethod: 'Arrow functions as class methods cannot be translated to Java. Use regular method syntax instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      PropertyDefinition(node) {
        if (
          node.value &&
          node.value.type === 'ArrowFunctionExpression'
        ) {
          context.report({
            node,
            messageId: 'noArrowMethod',
          });
        }
      },
    };
  },
});
