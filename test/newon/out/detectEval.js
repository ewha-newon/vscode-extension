"use strict";
//detectEval.ts - code injection eval() 탐지
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
exports.detectEval = detectEval;
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
function detectEval(code) {
    const lines = code.split('\n');
    const evalList = [];
    // 코드를 AST로 파싱
    const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });
    // AST를 탐색하여 eval 사용을 감지
    walk.simple(ast, {
        CallExpression(node) {
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
//# sourceMappingURL=detectEval.js.map