import * as vscode from 'vscode';
import { createLinterResultsView } from '../views/linterResultsView';
import { IncludeFileTreeProvider } from '../providers/includeFileTreeProvider';

export async function registerLintCommand(
    context: vscode.ExtensionContext,
    includeFileProvider: IncludeFileTreeProvider,
    setPanelCallback: (panel: vscode.WebviewPanel) => void
) {
    const disposable = vscode.commands.registerCommand('capl-linter.lint', async () => {
        vscode.window.showInformationMessage('Loading CAPL Linter...');
        const panel = await createLinterResultsView(context, includeFileProvider);
        setPanelCallback(panel);
    });

    context.subscriptions.push(disposable);
}