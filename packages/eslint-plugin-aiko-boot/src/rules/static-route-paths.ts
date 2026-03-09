/**
 * Rule: static-route-paths
 * Enforce static string literals for route paths
 */
import { ESLintUtils, AST_NODE_TYPES } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const staticRoutePaths = createRule({
  name: 'static-route-paths',
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce static string literals for route paths',
    },
    messages: {
      staticPath: 'Route paths must be static string literals for Java translation.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const ROUTE_DECORATORS = [
      'RestController',
      'GetMapping',
      'PostMapping',
      'PutMapping',
      'DeleteMapping',
      'PatchMapping',
      'RequestMapping',
    ];

    return {
      Decorator(node: any) {
        if (node.expression.type !== AST_NODE_TYPES.CallExpression) {
          return;
        }

        const callee = node.expression.callee;
        if (callee.type !== AST_NODE_TYPES.Identifier) {
          return;
        }

        if (!ROUTE_DECORATORS.includes(callee.name)) {
          return;
        }

        const args = node.expression.arguments;
        
        if (args.length > 0) {
          const firstArg = args[0];
          
          if (firstArg.type !== AST_NODE_TYPES.Literal && 
              firstArg.type !== AST_NODE_TYPES.ObjectExpression) {
            context.report({
              node: firstArg,
              messageId: 'staticPath',
            });
          }
          
          if (firstArg.type === AST_NODE_TYPES.ObjectExpression) {
            const pathProp = firstArg.properties.find(
              (prop: any) => prop.key?.name === 'path'
            );
            
            if (pathProp && (pathProp as any).value?.type !== AST_NODE_TYPES.Literal) {
              context.report({
                node: (pathProp as any).value,
                messageId: 'staticPath',
              });
            }
          }
        }
      },
    };
  },
});
