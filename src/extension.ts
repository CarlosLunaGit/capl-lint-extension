// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { lintDocument } from './lint';

const diagnosticsCollection = vscode.languages.createDiagnosticCollection('caplLint');

function updateDiagnostics(document: vscode.TextDocument, errors: any[]): void {
  const diagnostics: vscode.Diagnostic[] = errors.map(err => {
    const range = new vscode.Range(
      new vscode.Position(err.line - 1, 0),
      new vscode.Position(err.line - 1, Number.MAX_VALUE)
    );
    return new vscode.Diagnostic(range, err.message, vscode.DiagnosticSeverity.Warning);
  });

  diagnosticsCollection.set(document.uri, diagnostics);
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const diagnosticsCollection = vscode.languages.createDiagnosticCollection('caplLint');
    context.subscriptions.push(diagnosticsCollection);

    let includeFileProvider = new IncludeFileTreeProvider();

    // Register the tree view provider
    vscode.window.registerTreeDataProvider('includeFileExplorer', includeFileProvider);

    // Register command for linting
    let disposable = vscode.commands.registerCommand('capl-linter.lint', async () => {
        vscode.window.showInformationMessage('Loading extension CAPL-lint!');

        const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        const panel = vscode.window.createWebviewPanel(
            'CAPLLinter',
            'CAPL-Linter Extension',
            columnToShowIn ? vscode.ViewColumn.Beside : vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const highlightDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255,0,0,0.3)',
            isWholeLine: true,
            after: {
                contentText: ' ',
                fontWeight: 'bold',
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.7)',
                margin: '0 0 0 20px'
            }
        });

        const editor = vscode.window.activeTextEditor;
        if (editor) {
            const document = editor.document;
            const lintErrors = await lintDocument(document);
            const fileName = path.basename(editor.document.fileName);
            panel.webview.html = getWebviewContent(lintErrors, fileName);

            // Update the tree view for the active document
            includeFileProvider.refresh(document.fileName);
        }

        panel.webview.onDidReceiveMessage(async message => {
            const editor = vscode.window.visibleTextEditors.find(e => e.document.fileName.includes(message.target));
            if (!editor) {
                return;
            }

            switch (message.command) {
                case 'scrollToLine':
                    const line = message.line - 1;
                    const range = editor.document.lineAt(line).range;
                    editor.revealRange(range, vscode.TextEditorRevealType.InCenter);
                    editor.setDecorations(highlightDecorationType, [
                        {
                            range,
                            hoverMessage: new vscode.MarkdownString(`**${message.message}**`)
                        }
                    ]);
                    break;

                case 'retriggerLint':
                    const document = editor.document;
                    const lintErrors = await lintDocument(document);
                    const fileName = path.basename(editor.document.fileName);
                    panel.webview.html = getWebviewContent(lintErrors, fileName);
                    break;
            }
        });

        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e?.document) {

                let newFileInScope = e?.document.fileName.split('\\').pop();
                console.log(newFileInScope);
                // Send a message to our webview.
                // You can send any JSON serializable data.
                if (newFileInScope !== undefined) {
                    panel.webview.postMessage({ command: 'updateTargetFile', target: newFileInScope });

                }

                includeFileProvider.refresh(e.document.fileName);
            }
        }, null, context.subscriptions);
    });

    context.subscriptions.push(disposable);

    // Handle initial activation of the extension by setting the tree view based on the active editor
    if (vscode.window.activeTextEditor) {
        includeFileProvider.refresh(vscode.window.activeTextEditor.document.fileName);
    }
}


function countErrorsByType(errors: any) {
    const errorCount = {
        ERROR: 0,
        WARNING: 0,
        TOTAL:0
    };

    errors.forEach((error: { type: string; }) => {
        if (error.type.toUpperCase() === 'ERROR') {
            errorCount.ERROR++;
        } else if (error.type.toUpperCase() === 'WARNING') {
            errorCount.WARNING++;
        }
        errorCount.TOTAL++;
    });

    return errorCount;
}


function getWebviewContent(errors: any, fileName: string | undefined) {
    // Start the HTML structure
    let contentHtml;
    let errorsCount = countErrorsByType(errors.errors);
    if (errorsCount.TOTAL === 0) {
        contentHtml =`
                <div class="error">
                    <div class="content" id="" style="display: block;">
                        <p>No errors found! You are awesome :)</p>
                    </div>
                </div>
            `;
    } else {
        contentHtml = errors.errors.map((error: any, index: any) => {
            return `
                <div class="error">
                    <button onclick="toggleDetail(${index})" class="collapsible ${error.type}">Error on Line: ${error.line}</button>
                    <div class="content" id="detail-${index}" style="display: none;">
                        <p>${error.error}</p>
                    </div>
                </div>
            `;
        }).join('');
    }


    // Return full HTML page
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CAPL Linter</title>
        <style>
            body, html {
                height: 100%;
                margin: 0;
                font-family: Arial, sans-serif;
            }
			.error {
					width: -webkit-fill-available;
				}
			.title {
					color: #1a73e8;
					margin-bottom: 20px;
				}
            .collapsible {
                background-color: #777;
                color: white;
                cursor: pointer;
                padding-block: 0.5em;
                padding-inline: 1em;
                width: 100%;
                border: none;
                text-align: left;
                outline: none;
                font-size: 15px;
                border-radius: 5px;
                margin-top: 0.2em;
                margin-bottom: 0.2em;
            }
            .Error {
                border: 1px solid #e74c3c;
            }
            .Warning {
                border: 1px solid #f39c12;
            }
            .active, .collapsible:hover {
                background-color: #555;
            }
            .content {
				text-align: center;
                padding: 0 18px;
                display: none;
                overflow: hidden;
                background-color: #212121;
            }
			.contentParagraph {
					text-align: center;
					max-width: 600px;
					margin-top: 20px;
				}
			.container {
					padding: 20px;
					height: 100%;
					display: flex;
					flex-direction: column;
					justify-content: flex-start;
					align-items: center;
					background-color: #212121;
				}
			.fileName,.fileNameResults {
                width: -webkit-fill-available;
                height: 2em;
                border-radius: 2px;

                }
            .tab {
                overflow: hidden;
                border-bottom: 1px solid #ccc;
                width: -webkit-fill-available;
            }
            .tab button {
                background-color: inherit;
                float: left;
                border: none;
                outline: none;
                cursor: pointer;
                padding: 14px 16px;
                transition: 0.3s;
                font-size: 17px;
                color: #ccc;
            }
            .tab button:hover {
                background-color: #dddddd1f;
            }
            .tab button.active {
                border-bottom: 2px solid #3794ff;
                color: white;
                font-weight: bold;
            }
            .tabcontent {
                display: none;
                border-top: none;
                width: -webkit-fill-available;
            }
            button.text-button {
                align-items: center;
                border: 1px solid #0078d4;
                border-radius: 2px;
                box-sizing: border-box;
                cursor: pointer;
                display: flex;
                justify-content: center;
                line-height: 18px;
                padding: 4px;
                text-align: center;
                padding-inline: 2em;
                background-color: #0078d4;
                color: aliceblue;
            }
            .section{
                padding-bottom: 1em;
                margin-top: 10px;
            }

            .section button,
            .section input{
                border-radius: 5px;

            }

            .stats-cards {
                display: flex;
                justify-content: space-around;
                width: 100%;

            }

            .card {
                padding: 10px;
                border-radius: 10px;
                color: white;
                text-align: center;
                flex-grow: 1;
                margin: 5px;
            }

            .lint-errors {
                border: 1px solid #e74c3c;
            }

            .warnings {
                border: 1px solid #f39c12; /* Orange for warnings */
            }

            .style-errors {
                border: 1px solid #3498db; /* Blue for style errors */
            }
        </style>
    </head>
    <body>
		<div class="container">
				<h1 class="title">Visual Studio CAPL Linter Extension</h1>
                <p class="contentParagraph">
					Welcome to the CAPL Linter! Use this panel to manage your CAPL code analysis, view results,
					and customize your linting preferences.
				</p>
                <div class="tab">
                    <button class="tablinks" onclick="openTab(event, 'WorkingArea')">Working Area</button>
                    <button class="tablinks" onclick="openTab(event, 'Settings')">Settings</button>
                    <button class="tablinks" onclick="openTab(event, 'DonationsSubscriptions')">Donations & Subscriptions</button>
                </div>

				<div id="WorkingArea" class="tabcontent action-label">
                    <div class="section">
                        <h2>Lint Errors</h2>
                        <div class="section"><label for="fileName">Active File:</label></div>
                        <input type="text" class="fileName" id="fileName" value="${fileName}" readonly>
                    </div>
                    <div class="section">
                        <div class="section"><label for="actions">Actions:</label></div>
                        <button onclick="retriggerLint()" class="text-button">Re-trigger Lint</button>
                    </div>
                    <div class="section">
                        <div class="section"><label for="actions">Stats:</label></div>
                        <div class="stats-cards">
                            <div class="card lint-errors">
                                <h3>Lint Errors</h3>
                                <p>${errorsCount.ERROR}</p>
                            </div>

                            <div class="card warnings">
                                <h3>Warnings</h3>
                                <p>${errorsCount.WARNING}</p>

                            </div>
                            <!--
                            <div class="card style-errors">
                                <h3>Style Errors</h3>
                                <p>3</p>
                            </div>
                            -->
                        </div>
                    </div>
                    <div class="section">
                        <div class="section"><label for="results">Results from:</label></div>
                        <input type="text" class="fileNameResults" id="fileNameResults" value="${fileName}" readonly>
                        ${contentHtml}
                    </div>




                </div>

                <div id="Settings" class="tabcontent action-label">
                    <h2>Settings</h2>
                    <p>Adjust your lint settings here. (***Under construction to be released on: V1.1.0***)</p>
                </div>

                <div id="DonationsSubscriptions" class="tabcontent action-label">
                    <h2>Donations</h2>
                    <p>Would you like to support this project?, Why not buying us a Coffee? ;)</p>



                    <a href="https://buy.stripe.com/3cs6poeID2nKaDm7ss"> Donate with Stripe</a>
                    </a>

                    <h2>Subscriptions</h2>
                    <p>Manage your Subscription here. (***Under construction to be released on: V1.1.0***)</p>
                </div>
			</div>

        <script>
            const vscode = acquireVsCodeApi();

            function openTab(evt, tabName) {
                var i, tabcontent, tablinks;
                tabcontent = document.getElementsByClassName("tabcontent");
                for (i = 0; i < tabcontent.length; i++) {
                    tabcontent[i].style.display = "none";
                }
                tablinks = document.getElementsByClassName("tablinks");
                for (i = 0; i < tablinks.length; i++) {
                    tablinks[i].className = tablinks[i].className.replace(" active", "");
                }
                document.getElementById(tabName).style.display = "block";
                evt.currentTarget.className += " active";
            }

			document.querySelectorAll('.collapsible').forEach((btn, idx) => {
                btn.onclick = function () {
                    const lineNum = parseInt(this.innerText.split('Error on Line: ')[1]);
                    vscode.postMessage({
                        command: 'scrollToLine',
                        target: document.getElementById('fileName').value,
                        line: lineNum,
                        message: \`Check lint error at line \${lineNum}\` // Message you want to show in tooltip
                    });
					toggleDetail(idx);
                };
            });

            function toggleDetail(index) {
                let details = document.getElementById('detail-' + index);
                details.style.display = details.style.display === 'block' ? 'none' : 'block';
            }

            function retriggerLint() {
                vscode.postMessage({
                    command: 'retriggerLint',
                    target: document.getElementById('fileName').value
                 });
            }

            // Default open tab
            document.getElementsByClassName('tablinks')[0].click();

            // Handle the message inside the webview
            window.addEventListener('message', event => {

                const message = event.data; // The JSON data our extension sent

                switch (message.command) {
                    case 'updateTargetFile':
                        document.getElementById('fileName').value = message.target;
                        break;
                }
            })
        </script>
    </body>
    </html>
    `;
}

// File tree view for the extension Start

class IncludeFileTreeProvider implements vscode.TreeDataProvider<IncludeFileTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<IncludeFileTreeItem | undefined | void> = new vscode.EventEmitter<IncludeFileTreeItem | undefined | void>();
    readonly onDidChangeTreeData: vscode.Event<IncludeFileTreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private treeItems: IncludeFileTreeItem[] = [];

    refresh(filePath: string): void {
        this.treeItems = this.getTreeItemsForFile(filePath);
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: IncludeFileTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: IncludeFileTreeItem): IncludeFileTreeItem[] {
        if (!element) {
            return this.treeItems;
        } else {
            return [];
        }
    }

    private getTreeItemsForFile(filePath: string): IncludeFileTreeItem[] {
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



// File tree view for the extension End


// This method is called when your extension is deactivated
export function deactivate() {}
