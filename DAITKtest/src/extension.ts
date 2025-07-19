import * as vscode from 'vscode';
import { AssemblyExplorerProvider } from './providers/AssemblyExplorerProvider.js';
import { DAITKDecompilerProvider } from './providers/DAITKDecompilerProvider.js';
import { DecompilationStatusProvider } from './providers/DecompilationStatusProvider.js';
import { Logger } from './utils/Logger.js';

let decompilerProvider: DAITKDecompilerProvider;
let assemblyExplorerProvider: AssemblyExplorerProvider;
let decompilationStatusProvider: DecompilationStatusProvider;
let logger: Logger;

export function activate(context: vscode.ExtensionContext) {
  logger = new Logger('DAITKExtension');
  logger.info('Activating DAITK AI Decompiler extension...');

  try {
    // Initialize providers
    decompilerProvider = new DAITKDecompilerProvider(context);
    assemblyExplorerProvider = new AssemblyExplorerProvider(context);
    decompilationStatusProvider = new DecompilationStatusProvider(context);

    // Register commands
    const decompileFunction = vscode.commands.registerCommand(
      'daitk.decompileFunction',
      async () => {
        try {
          await decompilerProvider.decompileCurrentFunction();
        } catch (error) {
          logger.error('Failed to decompile function:', error);
          vscode.window.showErrorMessage('Failed to decompile function');
        }
      }
    );

    const verifyDecompilation = vscode.commands.registerCommand(
      'daitk.verifyDecompilation',
      async () => {
        try {
          await decompilerProvider.verifyCurrentDecompilation();
        } catch (error) {
          logger.error('Failed to verify decompilation:', error);
          vscode.window.showErrorMessage('Failed to verify decompilation');
        }
      }
    );

    const openAssemblyExplorer = vscode.commands.registerCommand(
      'daitk.openAssemblyExplorer',
      () => {
        assemblyExplorerProvider.refresh();
      }
    );

    // Register tree data providers
    const assemblyExplorerTreeDataProvider =
      vscode.window.registerTreeDataProvider(
        'daitkAssemblyExplorer',
        assemblyExplorerProvider
      );

    const decompilationStatusTreeDataProvider =
      vscode.window.registerTreeDataProvider(
        'daitkDecompilationStatus',
        decompilationStatusProvider
      );

    // Register file watchers
    const assemblyFileWatcher =
      vscode.workspace.createFileSystemWatcher('**/*.s');
    assemblyFileWatcher.onDidChange(() => {
      assemblyExplorerProvider.refresh();
    });
    assemblyFileWatcher.onDidCreate(() => {
      assemblyExplorerProvider.refresh();
    });
    assemblyFileWatcher.onDidDelete(() => {
      assemblyExplorerProvider.refresh();
    });

    // Add disposables to context
    context.subscriptions.push(
      decompileFunction,
      verifyDecompilation,
      openAssemblyExplorer,
      assemblyExplorerTreeDataProvider,
      decompilationStatusTreeDataProvider,
      assemblyFileWatcher
    );

    logger.info('DAITK AI Decompiler extension activated successfully');
  } catch (error) {
    logger.error('Failed to activate extension:', error);
    vscode.window.showErrorMessage(
      'Failed to activate DAITK AI Decompiler extension'
    );
  }
}

export function deactivate() {
  logger?.info('Deactivating DAITK AI Decompiler extension...');

  try {
    // Cleanup resources
    decompilerProvider?.dispose();
    assemblyExplorerProvider?.dispose();
    decompilationStatusProvider?.dispose();

    logger?.info('DAITK AI Decompiler extension deactivated successfully');
  } catch (error) {
    logger?.error('Error during deactivation:', error);
  }
}
