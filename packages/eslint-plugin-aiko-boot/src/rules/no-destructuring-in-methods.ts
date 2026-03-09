/**
 * Rule: no-destructuring-in-methods
 * Disallow destructuring in class methods (not Java-compatible)
 */
import { ESLintUtils } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noDestructuringInMethods = createRule({
  name: 'no-destructuring-in-methods',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow destructuring in class methods (not Java-compatible)',
    },
    messages: {
      noDestructuring: 'Destructuring cannot be easily translated to Java. Use explicit property access instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    let insideClassMethod = false;

    return {
      MethodDefinition() {
        insideClassMethod = true;
      },
      'MethodDefinition:exit'() {
        insideClassMethod = false;
      },
      VariableDeclarator(node) {
        if (
          insideClassMethod &&
          node.id.type === AST_NODE_TYPES.ObjectPattern
        ) {
          context.report({
            node,
            messageId: 'noDestructuring',
          });
        }
      },
    };
  },
});
