import * as vscode from 'vscode';
import { lintDocument } from '../lint';
import { getWebviewContent, attachWebviewListeners } from '../utils/webViewUtils';
import { IncludeFileTreeProvider } from '../providers/includeFileTreeProvider';

/**
 * Creates and manages the CAPL Linter webview.
 * @param context - The extension context.
 * @param includeFileProvider - The include file tree provider.
 * @returns The created webview panel.
 */
export async function createLinterResultsView(
    context: vscode.ExtensionContext,
    includeFileProvider: IncludeFileTreeProvider
): Promise<vscode.WebviewPanel> {

    const columnToShowIn = vscode.window.activeTextEditor
                ? vscode.window.activeTextEditor.viewColumn
                : undefined;

    const panel = vscode.window.createWebviewPanel(
        'CAPLLinter',
        'CAPL Linter Results',
        columnToShowIn ? vscode.ViewColumn.Beside : vscode.ViewColumn.One,
        { enableScripts: true }
    );

    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const document = editor.document;
        const lintErrors = await lintDocument(document);
        const fileName = vscode.workspace.asRelativePath(editor.document.fileName);
        panel.webview.html = getWebviewContent(lintErrors, fileName);

        attachWebviewListeners(panel, includeFileProvider);
    }

    return panel;
}