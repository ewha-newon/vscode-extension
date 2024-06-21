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
exports.checkCSRFToken = checkCSRFToken;
const vscode = __importStar(require("vscode"));
function checkCSRFToken(document) {
    const diagnostics = [];
    const text = document.getText();
    const lines = text.split('\n');
    const csrfVulnerableMethods = ['POST', 'PUT', 'DELETE'];
    lines.forEach((line, lineNumber) => {
        const trimmedLine = line.trim();
        // Check for vulnerable HTTP methods without CSRF token
        if (trimmedLine.startsWith('fetch') || trimmedLine.startsWith('axios') || trimmedLine.startsWith('$.ajax')) {
            if (csrfVulnerableMethods.some(method => trimmedLine.includes(`'${method}'`))) {
                // Check if there's a CSRF token check
                if (!text.includes('csrfToken')) {
                    const range = new vscode.Range(lineNumber, 0, lineNumber, line.length);
                    const diagnostic = new vscode.Diagnostic(range, 'Potential CSRF vulnerability detected', vscode.DiagnosticSeverity.Warning);
                    diagnostics.push(diagnostic);
                }
            }
        }
    });
    return diagnostics;
}
//# sourceMappingURL=csrfChecker.js.map