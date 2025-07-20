import * as vscode from 'vscode';
import { AssemblyExplorerProvider } from './providers/AssemblyExplorerProvider';
import { DAITKDecompilerProvider } from './providers/DAITKDecompilerProvider';
import { DAITKWebviewProvider } from './providers/DAITKWebviewProvider';
import {
  DecompilationResult,
  DecompilationResultsProvider,
} from './providers/DecompilationResultsProvider';
import { DecompilationStatusProvider } from './providers/DecompilationStatusProvider';
import { Logger } from './utils/Logger';

let decompilerProvider: DAITKDecompilerProvider;
let assemblyExplorerProvider: AssemblyExplorerProvider;
let decompilationStatusProvider: DecompilationStatusProvider;
let decompilationResultsProvider: DecompilationResultsProvider;
let webviewProvider: DAITKWebviewProvider;
let logger: Logger;

export function activate(context: vscode.ExtensionContext) {
  logger = new Logger('DAITKExtension');
  logger.info('Activating DAITK AI Decompiler extension...');

  try {
    // Initialize providers
    decompilerProvider = new DAITKDecompilerProvider(context);
    assemblyExplorerProvider = new AssemblyExplorerProvider(context);
    decompilationStatusProvider = new DecompilationStatusProvider(context);
    decompilationResultsProvider = new DecompilationResultsProvider(context);

    // Register webview provider
    const webviewProviderRegistration =
      vscode.window.registerWebviewViewProvider(DAITKWebviewProvider.viewType, {
        resolveWebviewView: (view: vscode.WebviewView) => {
          webviewProvider = new DAITKWebviewProvider(context, view);
        },
      } as vscode.WebviewViewProvider);

    // Register commands
    const decompileFunction = vscode.commands.registerCommand(
      'daitk.decompileFunction',
      async () => {
        logger.info('Decompile function command triggered');
        try {
          const result = await decompilerProvider.decompileCurrentFunction();
          if (result) {
            decompilationResultsProvider.addResult(result);
          }
        } catch (error) {
          logger.error('Failed to decompile function:', error);
          vscode.window.showErrorMessage('Failed to decompile function');
        }
      }
    );

    const verifyDecompilation = vscode.commands.registerCommand(
      'daitk.verifyDecompilation',
      async () => {
        logger.info('Verify decompilation command triggered');
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
        logger.info('Open assembly explorer command triggered');
        assemblyExplorerProvider.refresh();
      }
    );

    const showCCode = vscode.commands.registerCommand(
      'daitk.showCCode',
      async (result: DecompilationResult) => {
        logger.info('Show C code command triggered');
        try {
          const document = await vscode.workspace.openTextDocument({
            content: result.cCode,
            language: 'c',
          });
          await vscode.window.showTextDocument(document);
        } catch (error) {
          logger.error('Failed to show C code:', error);
          vscode.window.showErrorMessage('Failed to show C code');
        }
      }
    );

    const clearResults = vscode.commands.registerCommand(
      'daitk.clearResults',
      () => {
        logger.info('Clear results command triggered');
        decompilationResultsProvider.clearResults();
        vscode.window.showInformationMessage('Decompilation results cleared');
      }
    );

    const openDecompilerView = vscode.commands.registerCommand(
      'daitk.openDecompilerView',
      () => {
        logger.info('Open decompiler view command triggered');
        vscode.commands.executeCommand(
          'workbench.view.extension.daitk-sidebar'
        );
      }
    );

    // Add a simple test command
    const testCommand = vscode.commands.registerCommand('daitk.test', () => {
      logger.info('Test command triggered');
      vscode.window.showInformationMessage('DAITK Extension is working!');
    });

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

    const decompilationResultsTreeDataProvider =
      vscode.window.registerTreeDataProvider(
        'daitkDecompilationResults',
        decompilationResultsProvider
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
      webviewProviderRegistration,
      decompileFunction,
      verifyDecompilation,
      openAssemblyExplorer,
      showCCode,
      clearResults,
      openDecompilerView,
      testCommand,
      assemblyExplorerTreeDataProvider,
      decompilationStatusTreeDataProvider,
      decompilationResultsTreeDataProvider,
      assemblyFileWatcher
    );

    logger.info('DAITK AI Decompiler extension activated successfully');
    vscode.window.showInformationMessage(
      'DAITK AI Decompiler extension activated!'
    );
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
    decompilationResultsProvider?.dispose();
    webviewProvider?.dispose();

    logger?.info('DAITK AI Decompiler extension deactivated successfully');
  } catch (error) {
    logger?.error('Error during deactivation:', error);
  }
}
