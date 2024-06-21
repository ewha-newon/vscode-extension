//detectPathTraversal.ts - 파일 경로 취약점 탐지

import * as acorn from "acorn";
import * as walk from "acorn-walk";

export function detectPathTraversal(code: string): string[] {
    const lines = code.split('\n');
    const userInputs: string[] = [];
    const vulnerabilities: string[] = [];

    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    // AST를 탐색하여 사용자 입력을 감지
    walk.simple(ast, {
        MemberExpression(node: any) {
            if (node.property.name === 'query' || node.property.name === 'body' || node.property.name === 'params') {
                const inputString = node.object.name;
                if (!userInputs.includes(inputString)) {
                    userInputs.push(inputString);
                }
            }
        },
        CallExpression(node: any) {
            if ((node.callee.type === 'MemberExpression' && node.callee.object.name === 'path' && (node.callee.property.name === 'resolve' || node.callee.property.name === 'join')) ||
                (node.callee.type === 'Identifier' && (node.callee.name === 'resolve' || node.callee.name === 'join'))) {
                node.arguments.forEach((arg: any) => {
                    if (arg.type === 'Identifier' && userInputs.includes(arg.name)) {
                        const { start, end } = node.loc;
                        for (let i = start.line - 1; i < end.line; i++) {
                            const trimmedLine = lines[i].trim();
                            vulnerabilities.push(trimmedLine);
                        }
                    }
                });
            }
        }
    });

    return vulnerabilities;
}
