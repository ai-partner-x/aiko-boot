/**
 * Rule: no-inline-object-types
 * Disallow inline object types in method signatures (not Java-compatible)
 * Forces use of named DTO/interface types for better Java translation
 */
import { ESLintUtils, TSESTree } from '@typescript-eslint/utils';

const createRule = ESLintUtils.RuleCreator(
  (name) => `https://github.com/ai-partner-x/aiko-boot/blob/main/packages/eslint-plugin/docs/rules/${name}.md`
);

export const noInlineObjectTypes = createRule({
  name: 'no-inline-object-types',
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow inline object types in method signatures (not Java-compatible)',
    },
    messages: {
      noInlineReturnType: 'Inline object return types cannot be translated to Java. Define a named DTO/interface type instead.',
      noInlineParamType: 'Inline object parameter types cannot be translated to Java. Define a named DTO/interface type instead.',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    /**
     * Check if a type annotation is an inline object type (TSTypeLiteral)
     */
    function isInlineObjectType(node: TSESTree.TypeNode | undefined): boolean {
      if (!node) return false;
      
      // Direct inline object: { foo: string }
      if (node.type === 'TSTypeLiteral') {
        return true;
      }
      
      // Promise<{ foo: string }> or Array<{ foo: string }>
      if (node.type === 'TSTypeReference' && node.typeArguments) {
        return node.typeArguments.params.some(param => isInlineObjectType(param));
      }
      
      // Union types with inline objects: { foo: string } | null
      if (node.type === 'TSUnionType') {
        return node.types.some(t => isInlineObjectType(t));
      }
      
      return false;
    }

    return {
      // Check method return types
      MethodDefinition(node: TSESTree.MethodDefinition) {
        if (node.kind === 'constructor') return;
        
        const func = node.value;
        if (func.type === 'FunctionExpression' && func.returnType) {
          if (isInlineObjectType(func.returnType.typeAnnotation)) {
            context.report({
              node: func.returnType,
              messageId: 'noInlineReturnType',
            });
          }
        }
      },
      
      // Check parameter types in methods
      'MethodDefinition > FunctionExpression > Identifier[typeAnnotation]'(
        node: TSESTree.Identifier
      ) {
        if (node.typeAnnotation && isInlineObjectType(node.typeAnnotation.typeAnnotation)) {
          context.report({
            node: node.typeAnnotation,
            messageId: 'noInlineParamType',
          });
        }
      },
      
      // Also check decorated parameters (common in controllers)
      'MethodDefinition FunctionExpression > Identifier'(node: TSESTree.Identifier) {
        if (node.typeAnnotation && isInlineObjectType(node.typeAnnotation.typeAnnotation)) {
          context.report({
            node: node.typeAnnotation,
            messageId: 'noInlineParamType',
          });
        }
      },
    };
  },
});
