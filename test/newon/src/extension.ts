import * as vscode from 'vscode';
import { detectEval } from './detectEval';
import { detectPathTraversal } from './detectPathTraversal';

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

	context.subscriptions.push(disposable);
	context.subscriptions.push(detectEvalCommand);
	context.subscriptions.push(detectPathTraversalCommand);
}

// This method is called when your extension is deactivated
export function deactivate() {}
