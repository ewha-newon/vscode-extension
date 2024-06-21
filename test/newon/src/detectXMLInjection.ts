//detectXMLInjection.ts
import * as acorn from "acorn";
import * as walk from "acorn-walk";

export function detectXMLInjection(code: string): string[] {
    const xpathPattern = /xpath\.select\([^,]*\+.*\)/g;
    const xpathQueryPattern = /\/\/.*\[.*=.*'.*\+'.*\]/g;
    const potentialVulnerabilities: string[] = [];
    const queryVulnerabilities: string[] = [];

    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });

    // AST를 탐색하여 xpath 관련 호출을 감지
    walk.simple(ast, {
        CallExpression(node: any) {
            if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'xpath' && node.callee.property.name === 'select') {
                const arg = node.arguments[0];
                if (arg.type === 'BinaryExpression' && arg.operator === '+') {
                    const { start, end } = node.loc;
                    for (let i = start.line - 1; i < end.line; i++) {
                        const line = code.split('\n')[i].trim();
                        if (xpathPattern.test(line)) {
                            potentialVulnerabilities.push(line);
                        }
                    }
                }
            }
        },
        Literal(node: any) {
            const value = node.value;
            if (typeof value === 'string' && xpathQueryPattern.test(value)) {
                const { start, end } = node.loc;
                for (let i = start.line - 1; i < end.line; i++) {
                    const line = code.split('\n')[i].trim();
                    if (xpathQueryPattern.test(line)) {
                        queryVulnerabilities.push(line);
                    }
                }
            }
        }
    });

    return [...potentialVulnerabilities, ...queryVulnerabilities];
}
