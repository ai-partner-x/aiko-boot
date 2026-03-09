/**
 * Rule: explicit-return-type
 * Require explicit return types on class methods (for Java translation)
 */
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const explicitReturnType = createRule({
  name: 'explicit-return-type',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require explicit return types on class methods (for Java translation)',
    },
    messages: {
      missingReturnType: 'Class methods must have explicit return types for Java translation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      MethodDefinition(node: TSESTree.MethodDefinition) {
        // Skip constructor
        if (node.kind === 'constructor') {
          return;
        }

        const func = node.value;
        if (
          func.type === 'FunctionExpression' &&
          !func.returnType
        ) {
          context.report({
            node,
            messageId: 'missingReturnType',
          });
        }
      },
    };
  },
});
