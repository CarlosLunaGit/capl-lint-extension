import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class IncludeFileTreeProvider implements vscode.TreeDataProvider<IncludeFileTreeItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<IncludeFileTreeItem | undefined | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    private treeItems: IncludeFileTreeItem[] = [];

    refresh(filePath: string): void {
        try {
            this.treeItems = this.getTreeItemsForFile(filePath);
            this._onDidChangeTreeData.fire();
        } catch (error) {
            const message = (error instanceof Error) ? error.message : String(error);
            vscode.window.showErrorMessage(`Error refreshing tree view: ${message}`);
        }
    }

    getTreeItem(element: IncludeFileTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: IncludeFileTreeItem): IncludeFileTreeItem[] {
        return element ? [] : this.treeItems;
    }

    private getTreeItemsForFile(filePath: string): IncludeFileTreeItem[] {
        if (!fs.existsSync(filePath)) {
            return [];
        }
        const includes = parseCAPLFile(filePath);
        return includes.map(includePath => {
            const absolutePath = path.resolve(path.dirname(filePath), includePath);
            return new IncludeFileTreeItem(path.basename(absolutePath), vscode.TreeItemCollapsibleState.None, absolutePath);
        });
    }
}

class IncludeFileTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly filePath: string
    ) {
        super(label, collapsibleState);
        this.tooltip = filePath;
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [vscode.Uri.file(filePath)],
        };
    }
}

function parseCAPLFile(filePath: string): string[] {
    const content = fs.readFileSync(filePath, 'utf-8');
    return extractIncludes(content);
}

function extractIncludes(content: string): string[] {
    const includeRegex = /#include\s+["']([^"']+)["']/g;
    const includes: string[] = [];
    let match;
    while ((match = includeRegex.exec(content)) !== null) {
        includes.push(match[1]);
    }
    return includes;
}