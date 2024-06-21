//detectEval.ts - code injection eval() 탐지

import * as acorn from "acorn";
import * as walk from "acorn-walk";

export function detectEval(code: string): string[] {
    const lines = code.split('\n');
    const evalList: string[] = [];

    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });

    // AST를 탐색하여 eval 사용을 감지
    walk.simple(ast, {
        CallExpression(node: any) {
            if (node.callee.name === 'eval') {
                const { start, end } = node.loc;
                for (let i = start.line - 1; i < end.line; i++) {
                    const trimmedLine = lines[i].trim();
                    if (trimmedLine.includes('eval')) {
                        evalList.push(trimmedLine);
                    }
                }
            }
        }
    });

    return evalList;
}