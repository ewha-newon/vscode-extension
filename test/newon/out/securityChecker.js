"use strict";
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
function checkSecurityIssues(document) {
    const diagnostics = [];
    const sourceCode = document.getText();
    // 정규 표현식 패턴들
    const patterns = [
        {
            pattern: /\bdocument\.cookie\b/g,
            message: 'Potential Security Issue: Direct use of cookies',
        },
        {
            pattern: /\bprocess\.env\b/g,
            message: 'Potential Security Issue: Direct use of environment variables',
        },
        {
            pattern: /\.getElementById\(['"]([^'"]*hidden[^'"]*)['"]\)/g,
            message: 'Potential Security Issue: Use of hidden fields',
        },
        {
            pattern: /192\.168|file:\/\//g,
            message: 'Potential SSRF Attack: Suspicious URL',
        },
        {
            pattern: /\bhide\b/g,
            message: 'Warning: Found "hide" string',
        },
    ];
    // 정규 표현식을 사용하여 검사 수행
    patterns.forEach(({ pattern, message }) => {
        let match;
        while ((match = pattern.exec(sourceCode)) !== null) {
            const startPosition = document.positionAt(match.index);
            const endPosition = document.positionAt(match.index + match[0].length);
            const diagnostic = new vscode.Diagnostic(new vscode.Range(startPosition, endPosition), message, message.includes('Warning') ? vscode.DiagnosticSeverity.Warning : vscode.DiagnosticSeverity.Error);
            diagnostics.push(diagnostic);
        }
    });
    return diagnostics;
}
//# sourceMappingURL=securityChecker.js.map