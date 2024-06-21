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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const detectEval_1 = require("./detectEval");
const detectPathTraversal_1 = require("./detectPathTraversal");
const detectSourceInjection_1 = require("./detectSourceInjection");
const detectXMLInjection_1 = require("./detectXMLInjection");
const detectLDAPInjection_1 = require("./detectLDAPInjection");
const csrfChecker_1 = require("./csrfChecker");
const securityChecker_1 = require("./securityChecker");
function activate(context) {
    console.log('Congratulations, your extension "newon" is now active!');
    const disposable = vscode.commands.registerCommand('newon.helloWorld', () => {
        vscode.window.showInformationMessage('Hello World from newon!');
    });
    const detectEvalCommand = vscode.commands.registerCommand('newon.detectEval', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const evalList = (0, detectEval_1.detectEval)(code);
            if (evalList.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                evalList.forEach((evalString) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${evalString}`);
                });
            }
            else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });
    const detectPathTraversalCommand = vscode.commands.registerCommand('newon.detectPathTraversal', function () {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = (0, detectPathTraversal_1.detectPathTraversal)(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            }
            else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });
    const detectSourceInjectionCommand = vscode.commands.registerCommand('newon.detectSourceInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = (0, detectSourceInjection_1.detectSourceInjection)(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            }
            else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });
    const detectXMLInjectionCommand = vscode.commands.registerCommand('newon.detectXMLInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = (0, detectXMLInjection_1.detectXMLInjection)(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            }
            else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });
    const detectLDAPInjectionCommand = vscode.commands.registerCommand('newon.detectLDAPInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const results = (0, detectLDAPInjection_1.detectLDAPInjection)(code);
            if (results.length > 0) {
                results.forEach((result) => {
                    vscode.window.showInformationMessage(result);
                });
            }
            else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });
    const csrfDetectionCommand = vscode.commands.registerCommand('newon.detectCSRF', () => {
        // Get the active text editor
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            if (document.languageId === 'javascript') {
                // Perform CSRF vulnerability detection
                const diagnostics = (0, csrfChecker_1.checkCSRFToken)(document);
                // Create a diagnostic collection if not already created
                let diagnosticCollection = vscode.languages.createDiagnosticCollection('csrfTokenChecker');
                // Set the diagnostics for the current document
                diagnosticCollection.set(document.uri, diagnostics);
                // Dispose the diagnostic collection when the extension is deactivated
                context.subscriptions.push(diagnosticCollection);
            }
            else {
                vscode.window.showInformationMessage('Please open a JavaScript file to detect CSRF vulnerabilities.');
            }
        }
        else {
            vscode.window.showInformationMessage('No active text editor found.');
        }
    });
    console.log('Security Checker is now active!');
    // 파일 저장 시 보안 문제 검사
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('securityChecker');
    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'javascript') {
            const diagnostics = (0, securityChecker_1.checkSecurityIssues)(document);
            diagnosticsCollection.set(document.uri, diagnostics);
        }
    });
    // 확장 프로그램 종료 시 컬렉션 정리
    context.subscriptions.push(diagnosticsCollection);
    context.subscriptions.push(disposable);
    context.subscriptions.push(detectEvalCommand);
    context.subscriptions.push(detectPathTraversalCommand);
    context.subscriptions.push(detectSourceInjectionCommand);
    context.subscriptions.push(detectXMLInjectionCommand);
    context.subscriptions.push(detectLDAPInjectionCommand);
    context.subscriptions.push(csrfDetectionCommand);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map