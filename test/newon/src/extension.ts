import * as vscode from 'vscode';
import * as path from 'path';

import { detectEval } from './detectEval';
import { detectPathTraversal } from './detectPathTraversal';
import { detectSourceInjection } from './detectSourceInjection';
import { detectXMLInjection } from './detectXMLInjection';
import { detectLDAPInjection } from './detectLDAPInjection';
import { checkCSRFToken } from './csrfChecker';
import { checkSecurityIssues } from './securityChecker';
import { fuzz } from './fuzzing';
import { getChatGptResponse } from './ai';

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

	const fuzzCommand = vscode.commands.registerCommand('newon.fuzz', async () => {
		const url = await vscode.window.showInputBox({
			placeHolder: 'Enter the target URL',
		});

		if (url) {
            let outputFilePath: string | undefined;

            // Check if workspace folders are available
            const workspaceFolders = vscode.workspace.workspaceFolders;
            if (workspaceFolders && workspaceFolders.length > 0) {
                // Save in the workspace folder if it exists
                outputFilePath = path.join(workspaceFolders[0].uri.fsPath, 'fuzzing-results.txt');
            } else {
                // Ask the user to select a save location if no workspace folder is open
                const uri = await vscode.window.showSaveDialog({
                    saveLabel: 'Save Fuzzing Results',
                    filters: {
                        'Text Files': ['txt'],
                        'All Files': ['*']
                    },
                    defaultUri: vscode.Uri.file('fuzzing-results.txt')
                });

                if (uri) {
                    outputFilePath = uri.fsPath;
                } else {
                    vscode.window.showErrorMessage('No file path provided.');
                    return; // Exit if the user cancels the save dialog
                }
            }

            // Run the fuzzer and save the results
            await fuzz(url, outputFilePath);
        } else {
            vscode.window.showErrorMessage('No URL provided.');
        }
	});

    
    // Register the view provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            'chatSidebar',
            new AiViewProvider(context)
        )
    );

	const aiCommand = vscode.commands.registerCommand('newon.ai', async () => {
		// 현재 활성화된 에디터 가져오기
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('현재 열려있는 파일이 없습니다.');
            return;
        }

        // 현재 파일의 코드 가져오기
        const code = editor.document.getText();

        try {
			// ChatGPT API에서 개선된 코드 가져오기
			const improvedCode = await getChatGptResponse(code);
            console.log("improved code: ", improvedCode);

            // 기존 코드 텍스트 문서 생성
            const oldDocument = await vscode.workspace.openTextDocument({ content: code });
            const newDocument = await vscode.workspace.openTextDocument({ content: improvedCode });

            // diff view를 통해 두 코드 비교
            await vscode.commands.executeCommand('vscode.diff', oldDocument.uri, newDocument.uri, 'Original Code ↔ Improved Code');

			

		} catch (error) {
			console.error('ChatGPT API 호출 중 오류가 발생했습니다:', error);
			vscode.window.showErrorMessage('ChatGPT API 호출 중 오류가 발생했습니다.');
		}
	});

	console.log('Security Checker is now active!');

    // 파일 저장 시 보안 문제 검사
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('securityChecker');
    
    vscode.workspace.onDidSaveTextDocument((document) => {
        if (document.languageId === 'javascript') {
            const diagnostics = checkSecurityIssues(document);
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
	context.subscriptions.push(fuzzCommand);
    context.subscriptions.push(aiCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}


// WebviewViewProvider 클래스
class AiViewProvider implements vscode.WebviewViewProvider {
    public static currentPanel: AiViewProvider | undefined;
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {
        AiViewProvider.currentPanel = this;
    }

    public resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
        };

        webviewView.webview.html = this.getHtmlForWebview();

        // Send default message "Ask ChatGPT!" to webview on open
        this._view.webview.postMessage({ command: 'addMessage', text: 'Ask ChatGPT!' });

        webviewView.webview.onDidReceiveMessage((message) => {
            if (message.command === 'sendMessage') {
                vscode.window.showInformationMessage(message.text);
            }
        });
    }

    public addMessage(message: string) {
        if (this._view) {
            this._view.webview.postMessage({ command: 'addMessage', text: message });
        }
    }

    private getHtmlForWebview(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Chat Sidebar</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 10px;
                    }
                    .message {
                        background-color: #f3f3f3;
                        padding: 8px;
                        margin: 5px 0;
                        border-radius: 5px;
                    }
                </style>
            </head>
            <body>
                <div id="message-container"></div>

                <script>
                    const vscode = acquireVsCodeApi();
                    window.addEventListener('message', event => {
                        const message = event.data;
                        if (message.command === 'addMessage') {
                            const container = document.getElementById('message-container');
                            const div = document.createElement('div');
                            div.className = 'message';
                            div.textContent = message.text;
                            container.appendChild(div);
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
}
