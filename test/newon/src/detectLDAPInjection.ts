//detectLDAPInjection.ts
import * as acorn from "acorn";
import * as walk from "acorn-walk";

export function detectLDAPInjection(code: string): string[] {
    const lines = code.split('\n');
    const userInputs: string[] = [];
    const vulnerabilities: string[] = [];
    let parseFilterFound = false;

    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });

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
            if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'ldap' && node.callee.property.name === 'search') {
                node.arguments.forEach((arg: any) => {
                    if (arg.type === 'Identifier' && userInputs.includes(arg.name)) {
                        const { start, end } = node.loc;
                        for (let i = start.line - 1; i < end.line; i++) {
                            const line = code.split('\n')[i].trim();
                            vulnerabilities.push(line);
                        }
                    }
                });
            } else if (node.callee.type === 'Identifier' && node.callee.name === 'parseFilter') {
                parseFilterFound = true;
            }
        }
    });

    const results = [];
    if (vulnerabilities.length > 0) {
        results.push("취약한 코드가 감지되었습니다:");
        vulnerabilities.forEach((vuln) => {
            results.push(`취약한 코드: ${vuln}`);
        });
    }

    if (!parseFilterFound) {
        results.push("parseFilter 함수 사용 누락");
    }

    return results;
}
