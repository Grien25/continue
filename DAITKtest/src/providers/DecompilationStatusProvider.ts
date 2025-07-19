import * as vscode from 'vscode';
import { Logger } from '../utils/Logger.js';

export class DecompilationStatusProvider
  implements vscode.TreeDataProvider<StatusItem>
{
  private _onDidChangeTreeData: vscode.EventEmitter<
    StatusItem | undefined | null | void
  > = new vscode.EventEmitter<StatusItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    StatusItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private logger: Logger;
  private statusItems: StatusItem[] = [];

  constructor(private context: vscode.ExtensionContext) {
    this.logger = new Logger('DecompilationStatusProvider');
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  addStatusItem(item: StatusItem): void {
    this.statusItems.push(item);
    this.refresh();
  }

  clearStatus(): void {
    this.statusItems = [];
    this.refresh();
  }

  getTreeItem(element: StatusItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: StatusItem): Promise<StatusItem[]> {
    if (!element) {
      // Root level - show status items
      return this.statusItems;
    } else {
      // Item level - no children
      return [];
    }
  }

  dispose(): void {
    this.logger.info('Disposing DecompilationStatusProvider');
  }
}

export class StatusItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly status: 'success' | 'warning' | 'error' | 'info',
    public readonly description?: string,
    public readonly tooltip?: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);

    this.description = description;
    this.tooltip = tooltip;

    // Set icon based on status
    switch (status) {
      case 'success':
        this.iconPath = new vscode.ThemeIcon('check');
        break;
      case 'warning':
        this.iconPath = new vscode.ThemeIcon('warning');
        break;
      case 'error':
        this.iconPath = new vscode.ThemeIcon('error');
        break;
      case 'info':
        this.iconPath = new vscode.ThemeIcon('info');
        break;
    }
  }
}
