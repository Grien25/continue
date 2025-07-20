import * as vscode from 'vscode';
import { Logger } from '../utils/Logger.js';

export interface DecompilationResult {
  id: string;
  functionName: string;
  assemblyFile: string;
  cCode: string;
  status: 'success' | 'error' | 'warning';
  matchPercentage?: number;
  timestamp: Date;
  differences?: string[];
}

export class DecompilationResultsProvider
  implements vscode.TreeDataProvider<DecompilationResultItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    DecompilationResultItem | undefined | null | void
  > = new vscode.EventEmitter<
    DecompilationResultItem | undefined | null | void
  >();
  readonly onDidChangeTreeData: vscode.Event<
    DecompilationResultItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private logger: Logger;
  private results: DecompilationResult[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.logger = new Logger('DecompilationResultsProvider');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  addResult(result: DecompilationResult): void {
    this.results.unshift(result); // Add to beginning
    this.logger.info('Added decompilation result', {
      functionName: result.functionName,
      status: result.status,
    });
    this.refresh();
  }

  clearResults(): void {
    this.results = [];
    this.refresh();
  }

  getTreeItem(element: DecompilationResultItem): vscode.TreeItem {
    return element;
  }

  async getChildren(
    element?: DecompilationResultItem
  ): Promise<DecompilationResultItem[]> {
    if (!element) {
      // Root level - show all results
      return this.results.map((result) => new DecompilationResultItem(result));
    } else {
      // Result level - show details
      return element.getChildren();
    }
  }

  dispose(): void {
    this.logger.info('Disposing DecompilationResultsProvider');
  }
}

export class DecompilationResultItem extends vscode.TreeItem {
  constructor(public readonly result: DecompilationResult) {
    super(
      `${result.functionName} (${result.matchPercentage || 0}%)`,
      vscode.TreeItemCollapsibleState.Collapsed
    );

    this.tooltip = `${result.functionName} - ${result.status} - ${result.timestamp.toLocaleString()}`;
    this.description = `${result.assemblyFile} • ${result.status}`;

    // Set icon based on status
    switch (result.status) {
      case 'success':
        this.iconPath = new vscode.ThemeIcon('check');
        break;
      case 'warning':
        this.iconPath = new vscode.ThemeIcon('warning');
        break;
      case 'error':
        this.iconPath = new vscode.ThemeIcon('error');
        break;
    }

    // Add context value for commands
    this.contextValue = 'decompilationResult';
  }

  getChildren(): DecompilationResultItem[] {
    const children: DecompilationResultItem[] = [];

    // Add C code preview
    const cCodePreview = new DecompilationResultItem({
      id: `${this.result.id}_code`,
      functionName: 'Generated C Code',
      assemblyFile: '',
      cCode: this.result.cCode,
      status: this.result.status,
      timestamp: this.result.timestamp,
    });
    cCodePreview.collapsibleState = vscode.TreeItemCollapsibleState.None;
    cCodePreview.iconPath = new vscode.ThemeIcon('symbol-file');
    cCodePreview.command = {
      command: 'daitk.showCCode',
      title: 'Show C Code',
      arguments: [this.result],
    };
    children.push(cCodePreview);

    // Add verification details
    if (this.result.matchPercentage !== undefined) {
      const verificationItem = new DecompilationResultItem({
        id: `${this.result.id}_verification`,
        functionName: `Verification: ${this.result.matchPercentage}% match`,
        assemblyFile: '',
        cCode: '',
        status: this.result.status,
        timestamp: this.result.timestamp,
        matchPercentage: this.result.matchPercentage,
      });
      verificationItem.collapsibleState = vscode.TreeItemCollapsibleState.None;
      verificationItem.iconPath = new vscode.ThemeIcon('symbol-boolean');
      children.push(verificationItem);
    }

    // Add differences if any
    if (this.result.differences && this.result.differences.length > 0) {
      const differencesItem = new DecompilationResultItem({
        id: `${this.result.id}_differences`,
        functionName: `Differences (${this.result.differences.length})`,
        assemblyFile: '',
        cCode: '',
        status: 'warning',
        timestamp: this.result.timestamp,
        differences: this.result.differences,
      });
      differencesItem.collapsibleState =
        vscode.TreeItemCollapsibleState.Collapsed;
      differencesItem.iconPath = new vscode.ThemeIcon('symbol-warning');
      children.push(differencesItem);
    }

    return children;
  }
}
