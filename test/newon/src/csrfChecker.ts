import * as vscode from 'vscode';

export function checkCSRFToken(document: vscode.TextDocument): vscode.Diagnostic[] {
    const diagnostics: vscode.Diagnostic[] = [];
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
