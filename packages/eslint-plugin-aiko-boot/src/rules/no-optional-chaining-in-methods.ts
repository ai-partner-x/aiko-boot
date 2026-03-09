/**
 * Rule: no-optional-chaining-in-methods
 * Disallow optional chaining (?.) in class methods (not Java-compatible)
 */
import { ESLintUtils } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noOptionalChainingInMethods = createRule({
  name: 'no-optional-chaining-in-methods',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow optional chaining (?.) in class methods (not Java-compatible)',
    },
    messages: {
      noOptionalChaining: 'Optional chaining (?.) cannot be translated to Java. Use explicit null checks instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let inClassMethod = false;

    return {
      MethodDefinition() {
        inClassMethod = true;
      },
      'MethodDefinition:exit'() {
        inClassMethod = false;
      },
      ChainExpression(node) {
        if (inClassMethod) {
          context.report({
            node,
            messageId: 'noOptionalChaining',
          });
        }
      },
    };
  },
});
