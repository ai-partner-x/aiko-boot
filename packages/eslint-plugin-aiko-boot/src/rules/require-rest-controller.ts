/**
 * Rule: require-rest-controller
 * Require @RestController decorator for classes with route mapping decorators
 */
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const requireRestController = createRule({
  name: 'require-rest-controller',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require @RestController decorator for classes with route mapping decorators',
    },
    messages: {
      missingRestController: 'Classes with route mapping methods must have @RestController decorator.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const ROUTE_METHOD_DECORATORS = [
      'GetMapping',
      'PostMapping',
      'PutMapping',
      'DeleteMapping',
      'PatchMapping',
      'RequestMapping',
    ];

    return {
      ClassDeclaration(node) {
        let hasRouteMappings = false;
        let hasRestController = false;

        if (node.decorators) {
          for (const decorator of node.decorators) {
            if (decorator.expression.type === AST_NODE_TYPES.CallExpression) {
              const callee = decorator.expression.callee;
              if (callee.type === AST_NODE_TYPES.Identifier && callee.name === 'RestController') {
                hasRestController = true;
                break;
              }
            }
          }
        }

        if (node.body.type === AST_NODE_TYPES.ClassBody) {
          for (const member of node.body.body) {
            if (member.type === AST_NODE_TYPES.MethodDefinition && member.decorators) {
              for (const decorator of member.decorators) {
                if (decorator.expression.type === AST_NODE_TYPES.CallExpression) {
                  const callee = decorator.expression.callee;
                  if (
                    callee.type === AST_NODE_TYPES.Identifier &&
                    ROUTE_METHOD_DECORATORS.includes(callee.name)
                  ) {
                    hasRouteMappings = true;
                    break;
                  }
                }
              }
            }
          }
        }

        if (hasRouteMappings && !hasRestController) {
          context.report({
            node,
            messageId: 'missingRestController',
          });
        }
      },
    };
  },
});
