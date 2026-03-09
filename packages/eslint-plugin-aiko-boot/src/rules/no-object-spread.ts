/**
 * Rule: no-object-spread
 * Warn about object spread in class methods (difficult to translate to Java)
 */
import { ESLintUtils } from '@typescript-eslint/utils';
import { AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noObjectSpread = createRule({
  name: 'no-object-spread',
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn about object spread in class methods (difficult to translate to Java)',
    },
    messages: {
      noObjectSpread: 'Object spread is difficult to translate to Java. Consider using explicit property assignment or BeanUtils.copyProperties().',
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
      SpreadElement(node) {
        if (insideClassMethod && node.parent?.type === AST_NODE_TYPES.ObjectExpression) {
          context.report({
            node,
            messageId: 'noObjectSpread',
          });
        }
      },
    };
  },
});
