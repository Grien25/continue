import * as vscode from 'vscode';
import { AIService } from '../services/AIService.js';
import { CompilerService } from '../services/CompilerService.js';
import { VerificationService } from '../services/VerificationService.js';
import { Logger } from '../utils/Logger.js';

export class DAITKWebviewProvider {
  public static readonly viewType = 'daitk.decompilerView';
  private readonly _panel: vscode.WebviewPanel | undefined;
  private readonly _extensionUri: vscode.Uri;
  private logger: Logger;
  private aiService: AIService;
  private compilerService: CompilerService;
  private verificationService: VerificationService;

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly _view: vscode.WebviewView
  ) {
    this._extensionUri = context.extensionUri;
    this.logger = new Logger('DAITKWebviewProvider');
    this.aiService = new AIService();
    this.compilerService = new CompilerService();
    this.verificationService = new VerificationService();

    this._view.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri],
    };

    this._view.webview.html = this._getHtmlForWebview(this._view.webview);
    this._setWebviewMessageListener(this._view.webview);
  }

  private _getHtmlForWebview(webview: vscode.Webview): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DAITK AI Decompiler</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 16px;
            background: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
        }
        
        .container {
            max-width: 100%;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
            padding: 10px;
            background: var(--vscode-editor-inactiveSelectionBackground);
            border-radius: 6px;
        }
        
        .header h1 {
            margin: 0;
            font-size: 18px;
            color: var(--vscode-editor-foreground);
        }
        
        .section {
            margin-bottom: 20px;
        }
        
        .section-title {
            font-weight: 600;
            margin-bottom: 8px;
            color: var(--vscode-editor-foreground);
        }
        
        .input-group {
            margin-bottom: 12px;
        }
        
        .input-group label {
            display: block;
            margin-bottom: 4px;
            font-size: 12px;
            color: var(--vscode-descriptionForeground);
        }
        
        .input-field {
            width: 100%;
            min-height: 80px;
            padding: 8px;
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            background: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 11px;
            resize: vertical;
            box-sizing: border-box;
        }
        
        .input-field:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }
        
        .button-group {
            display: flex;
            gap: 8px;
            margin-bottom: 16px;
        }
        
        .btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
            font-weight: 500;
            transition: all 0.2s;
        }
        
        .btn-primary {
            background: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }
        
        .btn-primary:hover {
            background: var(--vscode-button-hoverBackground);
        }
        
        .btn-secondary {
            background: var(--vscode-button-secondaryBackground);
            color: var(--vscode-button-secondaryForeground);
        }
        
        .btn-secondary:hover {
            background: var(--vscode-button-secondaryHoverBackground);
        }
        
        .btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        .status {
            padding: 8px;
            border-radius: 4px;
            margin-bottom: 12px;
            font-size: 12px;
        }
        
        .status.success {
            background: var(--vscode-debugIcon-startForeground);
            color: white;
        }
        
        .status.warning {
            background: var(--vscode-problemsWarningIcon-foreground);
            color: white;
        }
        
        .status.error {
            background: var(--vscode-problemsErrorIcon-foreground);
            color: white;
        }
        
        .status.info {
            background: var(--vscode-problemsInfoIcon-foreground);
            color: white;
        }
        
        .progress {
            width: 100%;
            height: 4px;
            background: var(--vscode-progressBar-background);
            border-radius: 2px;
            overflow: hidden;
            margin-bottom: 12px;
        }
        
        .progress-bar {
            height: 100%;
            background: var(--vscode-progressBar-foreground);
            transition: width 0.3s ease;
        }
        
        .output-section {
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 12px;
            background: var(--vscode-editor-background);
        }
        
        .output-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .output-title {
            font-weight: 600;
            font-size: 12px;
        }
        
        .copy-btn {
            background: none;
            border: none;
            color: var(--vscode-textLink-foreground);
            cursor: pointer;
            font-size: 11px;
            text-decoration: underline;
        }
        
        .copy-btn:hover {
            color: var(--vscode-textLink-activeForeground);
        }
        
        .hidden {
            display: none;
        }
        
        .file-suggestion {
            background: var(--vscode-editor-inactiveSelectionBackground);
            border: 1px solid var(--vscode-input-border);
            border-radius: 4px;
            padding: 8px;
            margin-top: 8px;
            font-size: 11px;
        }
        
        .file-suggestion strong {
            color: var(--vscode-textLink-foreground);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 DAITK AI Decompiler</h1>
            <p style="margin: 4px 0 0 0; font-size: 11px; opacity: 0.8;">
                AI-powered assembly to C decompilation for Wii/GameCube
            </p>
        </div>
        
        <!-- Input Section -->
        <div class="section">
            <div class="section-title">📥 Assembly Input</div>
            
            <div class="input-group">
                <label for="assemblyInput">Assembly Code (PowerPC):</label>
                <textarea 
                    id="assemblyInput" 
                    class="input-field" 
                    placeholder="Paste your PowerPC assembly code here, or use the 'Find Function' button to extract from current file..."
                ></textarea>
            </div>
            
            <div class="button-group">
                <button id="findFunctionBtn" class="btn btn-secondary">
                    🔍 Find Function
                </button>
                <button id="clearInputBtn" class="btn btn-secondary">
                    🗑️ Clear
                </button>
            </div>
        </div>
        
        <!-- Decompilation Section -->
        <div class="section">
            <div class="section-title">⚙️ Decompilation</div>
            
            <div class="button-group">
                <button id="decompileBtn" class="btn btn-primary">
                    🚀 Decompile to C
                </button>
                <button id="decompileHeaderBtn" class="btn btn-primary">
                    📋 Decompile to Header
                </button>
            </div>
            
            <div id="progressContainer" class="hidden">
                <div class="progress">
                    <div id="progressBar" class="progress-bar" style="width: 0%"></div>
                </div>
                <div id="progressText" style="font-size: 11px; text-align: center;">
                    Initializing...
                </div>
            </div>
            
            <div id="statusContainer" class="hidden">
                <div id="statusMessage" class="status"></div>
            </div>
        </div>
        
        <!-- Output Section -->
        <div id="outputSection" class="section hidden">
            <div class="section-title">📤 Decompiled Output</div>
            
            <div class="output-section">
                <div class="output-header">
                    <div class="output-title">Generated C Code:</div>
                    <button id="copyCodeBtn" class="copy-btn">Copy</button>
                </div>
                <textarea 
                    id="cCodeOutput" 
                    class="input-field" 
                    readonly
                    style="min-height: 120px;"
                ></textarea>
            </div>
            
            <div id="verificationSection" class="output-section hidden">
                <div class="output-header">
                    <div class="output-title">Verification Results:</div>
                </div>
                <div id="verificationResults"></div>
            </div>
            
            <div class="file-suggestion">
                <strong>💡 Where to save:</strong><br>
                • C code: <code>src/decompiled/function_name.c</code><br>
                • Header: <code>include/decompiled/function_name.h</code><br>
                • Use "Copy" button to copy the code, then paste in your project
            </div>
        </div>
        
        <!-- History Section -->
        <div class="section">
            <div class="section-title">📚 Recent Decompilations</div>
            <div id="historyContainer">
                <div style="font-size: 11px; opacity: 0.7; text-align: center; padding: 20px;">
                    No recent decompilations
                </div>
            </div>
        </div>
    </div>
    
    <script>
        const vscode = acquireVsCodeApi();
        
        // Elements
        const assemblyInput = document.getElementById('assemblyInput');
        const findFunctionBtn = document.getElementById('findFunctionBtn');
        const clearInputBtn = document.getElementById('clearInputBtn');
        const decompileBtn = document.getElementById('decompileBtn');
        const decompileHeaderBtn = document.getElementById('decompileHeaderBtn');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const statusContainer = document.getElementById('statusContainer');
        const statusMessage = document.getElementById('statusMessage');
        const outputSection = document.getElementById('outputSection');
        const cCodeOutput = document.getElementById('cCodeOutput');
        const verificationSection = document.getElementById('verificationSection');
        const verificationResults = document.getElementById('verificationResults');
        const copyCodeBtn = document.getElementById('copyCodeBtn');
        const historyContainer = document.getElementById('historyContainer');
        
        // Event listeners
        findFunctionBtn.addEventListener('click', () => {
            vscode.postMessage({ command: 'findFunction' });
        });
        
        clearInputBtn.addEventListener('click', () => {
            assemblyInput.value = '';
            hideOutput();
        });
        
        decompileBtn.addEventListener('click', () => {
            const assemblyCode = assemblyInput.value.trim();
            if (!assemblyCode) {
                showStatus('Please enter assembly code first', 'error');
                return;
            }
            vscode.postMessage({ 
                command: 'decompile', 
                assemblyCode: assemblyCode,
                outputType: 'c'
            });
        });
        
        decompileHeaderBtn.addEventListener('click', () => {
            const assemblyCode = assemblyInput.value.trim();
            if (!assemblyCode) {
                showStatus('Please enter assembly code first', 'error');
                return;
            }
            vscode.postMessage({ 
                command: 'decompile', 
                assemblyCode: assemblyCode,
                outputType: 'header'
            });
        });
        
        copyCodeBtn.addEventListener('click', () => {
            cCodeOutput.select();
            document.execCommand('copy');
            showStatus('Code copied to clipboard!', 'success');
        });
        
        // Message handling
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.command) {
                case 'updateAssembly':
                    assemblyInput.value = message.assemblyCode || '';
                    break;
                    
                case 'showProgress':
                    showProgress(message.progress, message.message);
                    break;
                    
                case 'hideProgress':
                    hideProgress();
                    break;
                    
                case 'showResult':
                    showResult(message.cCode, message.verification);
                    break;
                    
                case 'showStatus':
                    showStatus(message.message, message.type);
                    break;
                    
                case 'updateHistory':
                    updateHistory(message.history);
                    break;
            }
        });
        
        function showProgress(percent, message) {
            progressContainer.classList.remove('hidden');
            progressBar.style.width = percent + '%';
            progressText.textContent = message;
        }
        
        function hideProgress() {
            progressContainer.classList.add('hidden');
        }
        
        function showStatus(message, type) {
            statusContainer.classList.remove('hidden');
            statusMessage.textContent = message;
            statusMessage.className = 'status ' + type;
            
            setTimeout(() => {
                statusContainer.classList.add('hidden');
            }, 3000);
        }
        
        function showResult(cCode, verification) {
            cCodeOutput.value = cCode;
            outputSection.classList.remove('hidden');
            
            if (verification) {
                verificationSection.classList.remove('hidden');
                verificationResults.innerHTML = \`
                    <div style="font-size: 11px;">
                        <strong>Match Percentage:</strong> \${verification.matchPercentage}%<br>
                        <strong>Status:</strong> \${verification.success ? '✅ Success' : '⚠️ Warning'}<br>
                        \${verification.differences ? '<strong>Issues:</strong><br>' + verification.differences.map(d => '• ' + d).join('<br>') : ''}
                    </div>
                \`;
            }
        }
        
        function hideOutput() {
            outputSection.classList.add('hidden');
            verificationSection.classList.add('hidden');
        }
        
        function updateHistory(history) {
            if (!history || history.length === 0) {
                historyContainer.innerHTML = \`
                    <div style="font-size: 11px; opacity: 0.7; text-align: center; padding: 20px;">
                        No recent decompilations
                    </div>
                \`;
                return;
            }
            
            historyContainer.innerHTML = history.map(item => \`
                <div style="padding: 8px; border-bottom: 1px solid var(--vscode-input-border); font-size: 11px;">
                    <div style="font-weight: 600;">\${item.functionName}</div>
                    <div style="opacity: 0.7;">\${item.timestamp} • \${item.matchPercentage}% match</div>
                </div>
            \`).join('');
        }
    </script>
</body>
</html>`;
  }

  private _setWebviewMessageListener(webview: vscode.Webview) {
    webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case 'findFunction':
            await this._findFunction(webview);
            break;
          case 'decompile':
            await this._decompileFunction(
              webview,
              message.assemblyCode,
              message.outputType
            );
            break;
        }
      },
      undefined,
      this.context.subscriptions
    );
  }

  private async _findFunction(webview: vscode.Webview) {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        webview.postMessage({
          command: 'showStatus',
          message: 'No active editor found',
          type: 'error',
        });
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'assembly') {
        webview.postMessage({
          command: 'showStatus',
          message: 'Current file is not an assembly file',
          type: 'error',
        });
        return;
      }

      // Extract function at cursor position
      const position = editor.selection.active;
      const assemblyCode = await this._extractFunctionAtPosition(
        document,
        position
      );

      if (assemblyCode) {
        webview.postMessage({
          command: 'updateAssembly',
          assemblyCode: assemblyCode,
        });
        webview.postMessage({
          command: 'showStatus',
          message: 'Function extracted successfully',
          type: 'success',
        });
      } else {
        webview.postMessage({
          command: 'showStatus',
          message: 'No function found at cursor position',
          type: 'warning',
        });
      }
    } catch (error) {
      this.logger.error('Error finding function:', error);
      webview.postMessage({
        command: 'showStatus',
        message: 'Error extracting function',
        type: 'error',
      });
    }
  }

  private async _decompileFunction(
    webview: vscode.Webview,
    assemblyCode: string,
    outputType: 'c' | 'header'
  ) {
    try {
      this.logger.info('Starting decompilation', { outputType });

      // Show progress
      webview.postMessage({
        command: 'showProgress',
        progress: 0,
        message: 'Initializing...',
      });

      // Step 1: Generate C code
      webview.postMessage({
        command: 'showProgress',
        progress: 30,
        message: 'Generating C code...',
      });
      const cCode = await this.aiService.generateCCode(assemblyCode);

      // Step 2: Compile for verification
      webview.postMessage({
        command: 'showProgress',
        progress: 60,
        message: 'Compiling for verification...',
      });
      const compilationResult = await this.compilerService.compileCCode(cCode);

      // Step 3: Verify
      webview.postMessage({
        command: 'showProgress',
        progress: 90,
        message: 'Verifying decompilation...',
      });
      const verificationResult =
        await this.verificationService.verifyDecompilation(
          assemblyCode,
          cCode,
          compilationResult
        );

      // Format output based on type
      let finalCode = cCode;
      if (outputType === 'header') {
        finalCode = this._convertToHeader(cCode);
      }

      // Hide progress and show results
      webview.postMessage({ command: 'hideProgress' });
      webview.postMessage({
        command: 'showResult',
        cCode: finalCode,
        verification: verificationResult,
      });

      webview.postMessage({
        command: 'showStatus',
        message: `Decompilation completed! (${verificationResult.matchPercentage}% match)`,
        type: verificationResult.success ? 'success' : 'warning',
      });
    } catch (error) {
      this.logger.error('Decompilation failed:', error);
      webview.postMessage({ command: 'hideProgress' });
      webview.postMessage({
        command: 'showStatus',
        message: `Decompilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  }

  private async _extractFunctionAtPosition(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<string | null> {
    const text = document.getText();
    const lines = text.split('\n');
    let startLine = position.line;
    let endLine = position.line;

    // Find function start
    for (let i = position.line; i >= 0; i--) {
      const lineText = lines[i].trim();
      if (
        lineText.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) ||
        lineText.includes('.fn') ||
        lineText.includes('function')
      ) {
        startLine = i;
        break;
      }
    }

    // Find function end
    for (let i = position.line; i < lines.length; i++) {
      const lineText = lines[i].trim();
      if (
        (lineText.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) ||
          lineText.includes('.fn') ||
          lineText.includes('function')) &&
        i > position.line
      ) {
        endLine = i - 1;
        break;
      }
    }

    return lines.slice(startLine, endLine + 1).join('\n');
  }

  private _convertToHeader(cCode: string): string {
    // Convert C implementation to header file
    const lines = cCode.split('\n');
    const headerLines: string[] = [];

    // Add header guards
    headerLines.push('#ifndef DECOMPILED_FUNCTION_H');
    headerLines.push('#define DECOMPILED_FUNCTION_H');
    headerLines.push('');

    // Extract includes
    const includes = lines.filter((line) => line.trim().startsWith('#include'));
    headerLines.push(...includes);
    if (includes.length > 0) headerLines.push('');

    // Extract function declarations
    for (const line of lines) {
      if (line.includes('{') && !line.trim().startsWith('//')) {
        // This is a function definition, convert to declaration
        const declaration = line.replace(/\s*\{.*$/, ';');
        headerLines.push(declaration);
      }
    }

    headerLines.push('');
    headerLines.push('#endif // DECOMPILED_FUNCTION_H');

    return headerLines.join('\n');
  }

  dispose(): void {
    this.logger.info('Disposing DAITKWebviewProvider');
  }
}
