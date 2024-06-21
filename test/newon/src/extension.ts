import * as vscode from 'vscode';
import { detectEval } from './detectEval';
import { detectPathTraversal } from './detectPathTraversal';
import { detectSourceInjection } from './detectSourceInjection';
import { detectXMLInjection } from './detectXMLInjection';
import { detectLDAPInjection } from './detectLDAPInjection';
import { checkCSRFToken } from './csrfChecker';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "newon" is now active!');

	const disposable = vscode.commands.registerCommand('newon.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from newon!');
	});
	const detectEvalCommand = vscode.commands.registerCommand('newon.detectEval', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const evalList = detectEval(code);
            if (evalList.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                evalList.forEach((evalString) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${evalString}`);
                });
            } else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });

	const detectPathTraversalCommand = vscode.commands.registerCommand('newon.detectPathTraversal', function() {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = detectPathTraversal(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            } else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });

	const detectSourceInjectionCommand = vscode.commands.registerCommand('newon.detectSourceInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = detectSourceInjection(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            } else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });

	const detectXMLInjectionCommand = vscode.commands.registerCommand('newon.detectXMLInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const vulnerabilities = detectXMLInjection(code);
            if (vulnerabilities.length > 0) {
                vscode.window.showInformationMessage('취약한 코드가 감지되었습니다:');
                vulnerabilities.forEach((vuln) => {
                    vscode.window.showInformationMessage(`취약한 코드: ${vuln}`);
                });
            } else {
                vscode.window.showInformationMessage('취약한 코드가 없습니다.');
            }
        }
    });

	const detectLDAPInjectionCommand = vscode.commands.registerCommand('newon.detectLDAPInjection', () => {
        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const code = document.getText();
            const results = detectLDAPInjection(code);
            if (results.length > 0) {
                results.forEach((result) => {
                    vscode.window.showInformationMessage(result);
                });
            } else {
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
                const diagnostics = checkCSRFToken(document);
                // Create a diagnostic collection if not already created
                let diagnosticCollection = vscode.languages.createDiagnosticCollection('csrfTokenChecker');
                // Set the diagnostics for the current document
                diagnosticCollection.set(document.uri, diagnostics);
                // Dispose the diagnostic collection when the extension is deactivated
                context.subscriptions.push(diagnosticCollection);
            } else {
                vscode.window.showInformationMessage('Please open a JavaScript file to detect CSRF vulnerabilities.');
            }
        } else {
            vscode.window.showInformationMessage('No active text editor found.');
        }
    });

	context.subscriptions.push(disposable);
	context.subscriptions.push(detectEvalCommand);
	context.subscriptions.push(detectPathTraversalCommand);
	context.subscriptions.push(detectSourceInjectionCommand);
	context.subscriptions.push(detectXMLInjectionCommand);
	context.subscriptions.push(detectLDAPInjectionCommand);
	context.subscriptions.push(csrfDetectionCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
