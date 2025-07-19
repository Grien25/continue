import * as vscode from 'vscode';
import { Logger } from '../utils/Logger.js';

export class AssemblyExplorerProvider
  implements vscode.TreeDataProvider<AssemblyItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    AssemblyItem | undefined | null | void
  > = new vscode.EventEmitter<AssemblyItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    AssemblyItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private logger: Logger;

  constructor(private context: vscode.ExtensionContext) {
    this.logger = new Logger('AssemblyExplorerProvider');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: AssemblyItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: AssemblyItem): Promise<AssemblyItem[]> {
    if (!element) {
      // Root level - show assembly files
      return this.getAssemblyFiles();
    } else if (element.type === 'file') {
      // File level - show functions in the file
      return this.getFunctionsInFile(element.resourceUri?.fsPath || '');
    } else {
      // Function level - no children
      return [];
    }
  }

  private async getAssemblyFiles(): Promise<AssemblyItem[]> {
    try {
      const assemblyFiles = await vscode.workspace.findFiles(
        '**/*.s',
        '**/node_modules/**'
      );

      return assemblyFiles.map(
        (file) =>
          new AssemblyItem(
            vscode.Uri.file(file.fsPath),
            vscode.TreeItemCollapsibleState.Collapsed,
            'file'
          )
      );
    } catch (error) {
      this.logger.error('Failed to get assembly files:', error);
      return [];
    }
  }

  private async getFunctionsInFile(filePath: string): Promise<AssemblyItem[]> {
    try {
      const document = await vscode.workspace.openTextDocument(filePath);
      const text = document.getText();
      const functions = this.parseFunctions(text);

      return functions.map(
        (func) =>
          new AssemblyItem(
            vscode.Uri.file(filePath),
            vscode.TreeItemCollapsibleState.None,
            'function',
            func.name,
            func.line
          )
      );
    } catch (error) {
      this.logger.error('Failed to get functions in file:', error);
      return [];
    }
  }

  private parseFunctions(text: string): Array<{ name: string; line: number }> {
    const functions: Array<{ name: string; line: number }> = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      // Look for function labels (simplified pattern)
      const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
      if (match) {
        functions.push({
          name: match[1],
          line: i + 1,
        });
      }
    }

    return functions;
  }

  dispose(): void {
    this.logger.info('Disposing AssemblyExplorerProvider');
  }
}

export class AssemblyItem extends vscode.TreeItem {
  constructor(
    public readonly resourceUri: vscode.Uri,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type: 'file' | 'function',
    public readonly functionName?: string,
    public readonly lineNumber?: number
  ) {
    super(
      type === 'file'
        ? resourceUri.path.split('/').pop() || 'Unknown'
        : functionName || 'Unknown Function',
      collapsibleState
    );

    this.tooltip =
      type === 'file'
        ? resourceUri.fsPath
        : `${functionName} (line ${lineNumber})`;

    this.description =
      type === 'file'
        ? vscode.workspace.asRelativePath(resourceUri)
        : `line ${lineNumber}`;

    if (type === 'function') {
      this.command = {
        command: 'vscode.open',
        title: 'Open Function',
        arguments: [
          resourceUri,
          {
            selection: new vscode.Range(
              new vscode.Position((lineNumber || 1) - 1, 0),
              new vscode.Position((lineNumber || 1) - 1, 0)
            ),
          },
        ],
      };
    }

    // Set icon based on type
    this.iconPath =
      type === 'file'
        ? new vscode.ThemeIcon('file')
        : new vscode.ThemeIcon('symbol-function');
  }
}
