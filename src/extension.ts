// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
// import * as vscode from 'vscode';

import * as vscode from 'vscode';
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

	console.log('Extension "capl-lint" is now active!');

	let disposable = vscode.commands.registerCommand('capl-linter.lint', async () => {
		vscode.window.showInformationMessage('Loading extension CAPL-lint!');

		const columnToShowIn = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

		var panel = vscode.window.createWebviewPanel(
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

		panel.webview.onDidReceiveMessage(
            async message => {
                const editors = vscode.window.visibleTextEditors;
                let editor;

                switch (message.command) {
                    case 'scrollToLine':

                        for (let index = 0; index < editors.length; index++) {

                            if (editors[index].document.fileName.includes(message.target)) {
                                editor = editors[index];
                            }


                        }

                        if (editor !== undefined) {
                            const line = message.line - 1;
                            const range = editor.document.lineAt(line).range;
                            editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

                            // Clear previous decorations
                            editor.setDecorations(highlightDecorationType, []);

                            // Set new decorations
                            const decoration = {
                                range: new vscode.Range(line, 0, line, Number.MAX_VALUE),
                                hoverMessage: new vscode.MarkdownString(`**${message.message}**`)
                            };
                            editor.setDecorations(highlightDecorationType, [decoration]);
                        }

                        break;

                    case 'retriggerLint':

                        for (let index = 0; index < editors.length; index++) {
                            if (editors[index].document.fileName.includes(message.target)) {
                                editor = editors[index];
                            }

                        }
                        if (editor) {
                            const document = editor.document;
                            const lintErrors = await lintDocument(document);
                            const fileName = editor.document.fileName.split('\\').pop();
                            panel.webview.html = getWebviewContent(lintErrors, fileName);
                        }
                        break;
                }
            },
            undefined,
            context.subscriptions
        );

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const lintErrors = await lintDocument(document);
			const fileName = editor.document.fileName.split('\\').pop();
            panel.webview.html = getWebviewContent(lintErrors, fileName);
		}

        // Update contents based on view state changes
        vscode.window.onDidChangeActiveTextEditor(
            e => {

                let newFileInScope = e?.document.fileName.split('\\').pop();
                console.log(newFileInScope);
                // Send a message to our webview.
                // You can send any JSON serializable data.
                if (newFileInScope !== undefined) {
                    panel.webview.postMessage({ command: 'updateTargetFile', target: newFileInScope });

                }
            },
            null,
            context.subscriptions
        );
	});


	context.subscriptions.push(disposable);



}




function getWebviewContent(errors: any, fileName: string | undefined) {
    // Start the HTML structure
    let contentHtml = errors.errors.map((error: any, index: any) => {
        return `
            <div class="error">
                <button onclick="toggleDetail(${index})" class="collapsible">Error on Line: ${error.line}</button>
                <div class="content" id="detail-${index}" style="display: none;">
                    <p>${error.error}</p>
                </div>
            </div>
        `;
    }).join('');

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
                        <div class="section"><label for="results">Results from:</label></div>
                        <input type="text" class="fileNameResults" id="fileNameResults" value="${fileName}" readonly>
                        ${contentHtml}
                    </div>




                </div>

                <div id="Settings" class="tabcontent action-label">
                    <h2>Settings</h2>
                    <p>Adjust your lint settings here. (***Under construction to be released on: V1.1.0***)</p>
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



// This method is called when your extension is deactivated
export function deactivate() {}
