import * as vscode from 'vscode';
import { registerLintCommand } from './commands/lintCommand';
import { IncludeFileTreeProvider } from './providers/includeFileTreeProvider';

let panelLinterCommand: vscode.WebviewPanel | undefined; // Global reference to the webview panel

export async function activate(context: vscode.ExtensionContext) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('caplLint');
    context.subscriptions.push(diagnosticsCollection);

    const includeFileProvider = new IncludeFileTreeProvider();

    // Register the tree view provider
    vscode.window.registerTreeDataProvider('includeFileExplorer', includeFileProvider);

    // Register the lint command
    registerLintCommand(context, includeFileProvider, (panel) => {
        panelLinterCommand = panel; // Store the panel reference globally
        panel.onDidDispose(() => {
            panelLinterCommand = undefined; // Clear the reference when the panel is disposed
        });
    });

    // Handle global events
    vscode.window.onDidChangeActiveTextEditor(
        (editor) => {
            if (!panelLinterCommand) {
                console.warn('Webview panel is not initialized. Skipping message.');
                return;
            }
            handleActiveEditorChange(editor, includeFileProvider, panelLinterCommand);
        },
        null,
        context.subscriptions
    );

    // Handle initial activation of the extension
    if (vscode.window.activeTextEditor) {
        includeFileProvider.refresh(vscode.window.activeTextEditor.document.fileName);
    }
}

function handleActiveEditorChange(
    editor: vscode.TextEditor | undefined,
    includeFileProvider: IncludeFileTreeProvider,
    panel: vscode.WebviewPanel
) {
    if (editor?.document) {
        const newFileInScope = editor.document.fileName.split('\\').pop();
        console.log(newFileInScope);

        // Send a message to our webview.
        if (newFileInScope !== undefined) {
            panel.webview.postMessage({ command: 'updateTargetFile', target: newFileInScope });
        }

        includeFileProvider.refresh(editor.document.fileName);
    }
}

export function deactivate() {}