import * as vscode from 'vscode';
import { IncludeFileTreeProvider } from '../providers/includeFileTreeProvider';
import { countErrorsByType } from './fileUtils';
import { lintDocument } from '../lint';

/**
 * Generates the HTML content for the webview.
 * @param errors - The linting errors to display.
 * @param fileName - The name of the file being analyzed.
 * @returns The HTML content as a string.
 */
export function getWebviewContent(errors: any, fileName: string | undefined): string {
    const errorsCount = countErrorsByType(errors.errors);

    let contentHtml = '';
    if (errorsCount.Total === 0) {
        contentHtml = '<p>No linting errors found!</p>';
    } else {
        contentHtml = errors.errors
            .map(
                (error: any, index: number) => `
                <div class="error ${error.type}-container" id="error-${index}">
                    <button class="collapsible ${error.type}" data-line="${error.row}" data-incident-type="${error.type}">
                        ${error.type} on Line: ${error.row}
                    </button>
                    <div class="content hidden" id="detail-${index}">
                        <p>${error.message}</p>
                    </div>
                </div>
            `
            )
            .join('');
    }

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
            .Info {
                border: 1px solid rgb(18, 172, 243);
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
                background-color: unset;
            }

            .warnings {
                border: 1px solid #f39c12; /* Orange for warnings */
                background-color: unset;
            }

            .info {
                border: 1px solid rgb(18, 172, 243);
                background-color: unset;
            }

            .totals {
                border: 1px solid rgb(79, 82, 84);
                background-color: unset;
            }

            .style-errors {
                border: 1px solidrgb(177, 52, 219); /* purple for style errors */
            }

            .hidden { display: none; }
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
                        <h2>Linter Results</h2>
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
                            <button class="card lint-errors" onclick="filterResults('Error')">
                                <h3>Lint Errors</h3>
                                <p>${errorsCount.Error}</p>
                            </button>
                            <button class="card warnings" onclick="filterResults('Warning')">
                                <h3>Warnings</h3>
                                <p>${errorsCount.Warning}</p>
                            </button>
                            <button class="card info" onclick="filterResults('Info')">
                                <h3>Info</h3>
                                <p>${errorsCount.Info}</p>
                            </button>
                            <button class="card totals" onclick="filterResults('Total')">
                                <h3>All types</h3>
                                <p>${errorsCount.Total}</p>
                            </button>
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
                    const lineNum = this.dataset.line;
                    const incidentType = this.dataset.incidentType;

                    vscode.postMessage({
                        command: 'scrollToLine',
                        target: document.getElementById('fileName').value,
                        line: lineNum,
                        message: \`Check linter \${incidentType} at line \${lineNum}\` // Message you want to show in tooltip
                    });
					toggleErrorDetails(idx);
                };
            });

            function filterResults(type) {

                if (type === 'Total')
                {
                    document.querySelectorAll('.error').forEach(el => {
                        el.classList.remove('hidden');
                    });
                }
                else
                {
                    document.querySelectorAll('.error').forEach(el => {
                        el.classList.add('hidden');
                    });
                    document.querySelectorAll('.' + type + '-container').forEach(el => {
                        el.classList.remove('hidden');
                    });
                }

            }

            function toggleErrorType(index) {
                const detail = document.getElementById('detail-' + index);
                detail.classList.toggle('hidden');
            }

            function toggleErrorDetails(index) {
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

/**
 * Attaches event listeners to the webview panel.
 * @param panel - The webview panel.
 * @param includeFileProvider - The include file tree provider.
 */
export function attachWebviewListeners(
    panel: vscode.WebviewPanel,
    includeFileProvider: IncludeFileTreeProvider
) {
    let currentDecorationType: vscode.TextEditorDecorationType | undefined;

    panel.webview.onDidReceiveMessage(async (message) => {
        const editor = vscode.window.visibleTextEditors.find((e) =>
            e.document.fileName.includes(message.target)
        );
        if (!editor) {
            return;
        }

        switch (message.command) {
            case 'scrollToLine':
                const line = message.line - 1;
                const range = editor.document.lineAt(line).range;

                if (currentDecorationType) {
                    editor.setDecorations(currentDecorationType, []);
                    currentDecorationType.dispose();
                }

                editor.revealRange(range, vscode.TextEditorRevealType.InCenter);

                currentDecorationType = vscode.window.createTextEditorDecorationType({
                    backgroundColor: 'rgba(255,0,0,0.3)',
                    isWholeLine: true,
                });

                editor.setDecorations(currentDecorationType, [
                    {
                        range,
                        hoverMessage: new vscode.MarkdownString(`**${message.message}**`),
                    },
                ]);
                break;

            case 'retriggerLint':
                const document = editor.document;
                const lintErrors = await lintDocument(document);
                const fileName = vscode.workspace.asRelativePath(editor.document.fileName);
                panel.webview.html = getWebviewContent(lintErrors, fileName);
                break;
        }
    });
}