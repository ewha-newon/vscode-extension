"use strict";
//detectSourceInjection.ts - 자원 삽입 취약점 탐지
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectSourceInjection = detectSourceInjection;
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
function detectSourceInjection(code) {
    const lines = code.split('\n');
    const userInputs = [];
    const vulnerabilities = [];
    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
    // AST를 탐색하여 사용자 입력을 감지
    walk.simple(ast, {
        MemberExpression(node) {
            if (node.property.name === 'query' || node.property.name === 'body' || node.property.name === 'params') {
                const inputString = node.object.name;
                if (!userInputs.includes(inputString)) {
                    userInputs.push(inputString);
                }
            }
        },
        CallExpression(node) {
            const regex = /\bio\s*\(/;
            if (node.callee.type === 'Identifier' && regex.test(node.callee.name)) {
                node.arguments.forEach((arg) => {
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
//# sourceMappingURL=detectSourceInjection.js.map