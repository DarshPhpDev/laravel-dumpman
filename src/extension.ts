import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Extension "laravel-dumpman" is now active!');

    let disposable = vscode.commands.registerCommand('extension.dumpVariable', () => {
        console.log('Command "extension.dumpVariable" triggered!');
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage("No active editor found.");
            return;
        }

        const document = editor.document;
        const selection = editor.selection;
        let content = '';

        const line = document.lineAt(selection.active.line);
        const lineText = line.text;
        const indentation = lineText.replace(lineText.trim(), '');

        if (selection.isEmpty) {
            content = getDump('');
        } else {
            let selectedText = document.getText(selection);

            if (document.getText(new vscode.Range(selection.start.translate(0, -1), selection.start)) === '$') {
                content = getDump('$' + selectedText);
            } else if (document.getText(new vscode.Range(selection.end, selection.end.translate(0, 1))) === '(') {
                let endIndex = findClosingParenthesis(document, selection.end);
                if (endIndex === -1) {
                    content = getDump('');
                } else {
                    selectedText = document.getText(new vscode.Range(selection.start, endIndex));
                    content = getDump(selectedText);
                }
            } else {
                content = getDump(selectedText);
            }
        }

        const newPosition = new vscode.Position(line.lineNumber + 1, 0);
        editor.edit(editBuilder => {
            editBuilder.insert(newPosition, indentation + content);
        });
    });

    context.subscriptions.push(disposable);
}

function getDump(content: string): string {
    return content ? `dd(${content});\n` : `dd('DumpMan');\n`;
}

function findClosingParenthesis(document: vscode.TextDocument, startPos: vscode.Position): vscode.Position | -1 {
    let text = document.getText();
    let cursorIndex = document.offsetAt(startPos);
    let balance = 1;

    for (let i = cursorIndex + 1; i < text.length; i++) {
        if (text[i] === '(') balance++;
        if (text[i] === ')') balance--;

        if (balance === 0) return document.positionAt(i);
    }

    return -1;
}

export function deactivate() {}