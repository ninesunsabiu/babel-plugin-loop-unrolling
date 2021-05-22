import type babelCore from '@babel/core';

type Core = typeof babelCore;

interface Config {
    opts: {
        directive?: string;
    };
}

export default function loopUnrolling(babel: Core): babelCore.PluginObj<Config> {
    const { types: t } = babel;

    const arrayLast = <T>(array: readonly T[]) => array.slice(-1)[0];

    const eqByTrim = (left: string, right: string) => left.trim() === right.trim();

    const defaultDirective = '@loader-helper loop-unrolling';

    const isTargetVariableDeclaration = (
        { node }: babelCore.NodePath<babelCore.types.VariableDeclaration>,
        { opts: { directive = defaultDirective } }: Config
    ) => {
        const leadingComments = node.leadingComments;
        const last = leadingComments && arrayLast(leadingComments);
        return last && eqByTrim(last.value, directive);
    };

    function assertAllElementIsExpress(
        elements: babelCore.types.ArrayExpression['elements'],
        path: babelCore.NodePath
    ): asserts elements is Array<babelCore.types.Expression | null> {
        if (elements.some((e) => t.isSpreadElement(e))) {
            throw path.buildCodeFrameError('loop-unrolling does not support SpreadElement yet');
        }
    }
    function assertMapFunctionOnly(
        callArguments: babelCore.types.CallExpression['arguments'],
        path: babelCore.NodePath
    ) {
        if (callArguments.length !== 1) {
            throw path.buildCodeFrameError('loop-unrolling does not support thisBound yet');
        }
    }

    function assertProcessFnIsIdentifier(
        processFn: babelCore.types.CallExpression['arguments'][number] | undefined,
        path: babelCore.NodePath
    ): asserts processFn is babelCore.types.Identifier {
        if (!t.isIdentifier(processFn)) {
            throw path.buildCodeFrameError('loop-unrolling only support an function pointer');
        }
    }

    return {
        name: 'loop-unrolling',
        visitor: {
            VariableDeclaration: {
                enter(path, state) {
                    if (isTargetVariableDeclaration(path, state)) {
                        const { declarations } = path.node;
                        declarations.forEach((modifiedDeclaration) => {
                            const { init } = modifiedDeclaration;
                            if (t.isCallExpression(init)) {
                                const { callee } = init;
                                if (t.isMemberExpression(callee)) {
                                    const { object } = callee;
                                    const items = t.isArrayExpression(object) ? object.elements : [];
                                    assertAllElementIsExpress(items, path);
                                    const callArgs = init.arguments;
                                    assertMapFunctionOnly(callArgs, path);
                                    const processFn = callArgs[0];
                                    assertProcessFnIsIdentifier(processFn, path);
                                    const callExpressions = items.map(
                                        (item, idx, array) =>
                                            item &&
                                            t.callExpression(processFn, [
                                                item,
                                                t.numericLiteral(idx),
                                                t.arrayExpression(array)
                                            ])
                                    );
                                    modifiedDeclaration.init = t.arrayExpression(callExpressions);
                                }
                            }
                        });
                    }
                }
            }
        }
    };
}
