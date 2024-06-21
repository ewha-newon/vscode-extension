"use strict";
// securityChecker.ts
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
exports.checkSecurityIssues = checkSecurityIssues;
const vscode = __importStar(require("vscode"));
const acorn = __importStar(require("acorn"));
const walk = __importStar(require("acorn-walk"));
function checkSecurityIssues(document) {
    const diagnostics = [];
    const sourceCode = document.getText();
    let ast;
    try {
        ast = acorn.parse(sourceCode, { ecmaVersion: 'latest' });
    }
    catch (e) {
        console.error('Error parsing JavaScript file:', e);
        return diagnostics;
    }
    walk.simple(ast, {
        CallExpression(node) {
            // 쿠키를 직접 사용하는 경우 감지
            if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'document' && node.callee.property.name === 'cookie') {
                const diagnostic = new vscode.Diagnostic(new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)), 'Potential Security Issue: Direct use of cookies', vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
            // 환경변수를 직접 사용하는 경우 감지
            if (node.callee.type === 'MemberExpression' && node.callee.object.name === 'process' && node.callee.property.name === 'env') {
                const diagnostic = new vscode.Diagnostic(new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)), 'Potential Security Issue: Direct use of environment variables', vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
            // 히든 필드를 사용하는 경우 감지
            if (node.callee.type === 'MemberExpression' && node.callee.property.name === 'getElementById') {
                const idArg = node.arguments[0];
                if (idArg && idArg.type === 'Literal' && typeof idArg.value === 'string' && idArg.value.toLowerCase().includes('hidden')) {
                    const diagnostic = new vscode.Diagnostic(new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)), 'Potential Security Issue: Use of hidden fields', vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(diagnostic);
                }
            }
            // 특정 URL 패턴에 대한 검사 (예시: 민감 정보 접근 시도)
            if (node.arguments && node.arguments.length > 0) {
                const firstArg = node.arguments[0];
                if (firstArg.type === 'Literal' && typeof firstArg.value === 'string') {
                    if (firstArg.value.includes('192.168') || firstArg.value.includes('file:///')) {
                        const diagnostic = new vscode.Diagnostic(new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)), 'Potential SSRF Attack: Suspicious URL', vscode.DiagnosticSeverity.Warning);
                        diagnostics.push(diagnostic);
                    }
                }
            }
        },
        // 추가: 'hide' 문자열을 감지하여 경고 메시지 생성
        Literal(node) {
            if (node.value === 'hide') {
                const diagnostic = new vscode.Diagnostic(new vscode.Range(document.positionAt(node.start), document.positionAt(node.end)), 'Warning: Found "hide" string', vscode.DiagnosticSeverity.Warning);
                diagnostics.push(diagnostic);
            }
        }
    });
    return diagnostics;
}
//# sourceMappingURL=securityChecker.js.map