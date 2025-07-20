import * as vscode from 'vscode';
import { AIService } from '../services/AIService';
import { CompilerService } from '../services/CompilerService';
import { VerificationService } from '../services/VerificationService';
import { Logger } from '../utils/Logger';
import { DecompilationResult } from './DecompilationResultsProvider';

export class DAITKDecompilerProvider {
  private context: vscode.ExtensionContext;
  private logger: Logger;
  private aiService: AIService;
  private compilerService: CompilerService;
  private verificationService: VerificationService;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
    this.logger = new Logger('DAITKDecompilerProvider');

    // Initialize services
    this.aiService = new AIService();
    this.compilerService = new CompilerService();
    this.verificationService = new VerificationService();
  }

  async decompileCurrentFunction(): Promise<DecompilationResult | null> {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      vscode.window.showWarningMessage('No active editor found');
      return null;
    }

    const document = editor.document;
    if (document.languageId !== 'assembly') {
      vscode.window.showWarningMessage('Current file is not an assembly file');
      return null;
    }

    try {
      this.logger.info('Starting decompilation of current function');

      // Get the selected text or current function
      const selection = editor.selection;
      const assemblyCode = selection.isEmpty
        ? await this.extractCurrentFunction(document, selection.start)
        : document.getText(selection);

      if (!assemblyCode) {
        vscode.window.showWarningMessage(
          'No function found at cursor position'
        );
        return null;
      }

      // Extract function name
      const functionName = this.extractFunctionName(assemblyCode);

      // Show progress
      const result = await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Decompiling function...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          // Step 1: Generate C code using AI
          progress.report({ increment: 30, message: 'Generating C code...' });
          const cCode = await this.aiService.generateCCode(assemblyCode);

          progress.report({ increment: 30, message: 'Compiling C code...' });

          // Step 2: Compile the generated C code
          const compilationResult =
            await this.compilerService.compileCCode(cCode);

          progress.report({
            increment: 40,
            message: 'Verifying decompilation...',
          });

          // Step 3: Verify the compilation
          const verificationResult =
            await this.verificationService.verifyDecompilation(
              assemblyCode,
              cCode,
              compilationResult
            );

          // Create result object
          const decompilationResult: DecompilationResult = {
            id: `decomp_${Date.now()}`,
            functionName: functionName,
            assemblyFile: document.fileName,
            cCode: cCode,
            status: verificationResult.success ? 'success' : 'warning',
            matchPercentage: verificationResult.matchPercentage,
            timestamp: new Date(),
            differences: verificationResult.differences,
          };

          return decompilationResult;
        }
      );

      // Show results
      await this.showDecompilationResults(result);

      return result;
    } catch (error) {
      this.logger.error('Decompilation failed:', error);
      vscode.window.showErrorMessage(
        `Decompilation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return null;
    }
  }

  async verifyCurrentDecompilation(): Promise<void> {
    try {
      this.logger.info('Starting verification of current decompilation');

      // This would verify the currently open C file against the original assembly
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showWarningMessage('No active editor found');
        return;
      }

      const document = editor.document;
      if (document.languageId !== 'c' && document.languageId !== 'cpp') {
        vscode.window.showWarningMessage('Current file is not a C/C++ file');
        return;
      }

      const cCode = document.getText();

      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: 'Verifying decompilation...',
          cancellable: false,
        },
        async (progress) => {
          progress.report({ increment: 0 });

          // Compile the C code
          progress.report({ increment: 50, message: 'Compiling C code...' });
          const compilationResult =
            await this.compilerService.compileCCode(cCode);

          // Verify against original
          progress.report({ increment: 50, message: 'Comparing objects...' });
          const verificationResult =
            await this.verificationService.verifyDecompilation(
              '', // Would need to get original assembly
              cCode,
              compilationResult
            );

          await this.showVerificationResults(verificationResult);
        }
      );
    } catch (error) {
      this.logger.error('Verification failed:', error);
      vscode.window.showErrorMessage(
        `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async extractCurrentFunction(
    document: vscode.TextDocument,
    position: vscode.Position
  ): Promise<string | null> {
    // Simple function extraction - in a real implementation, this would be more sophisticated
    const line = document.lineAt(position.line);
    const text = document.getText();

    // Look for function boundaries (simplified)
    const lines = text.split('\n');
    let startLine = position.line;
    let endLine = position.line;

    // Find function start (look for labels or function markers)
    for (let i = position.line; i >= 0; i--) {
      const lineText = lines[i].trim();
      if (
        lineText.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) ||
        lineText.includes('function') ||
        lineText.includes('.fn')
      ) {
        startLine = i;
        break;
      }
    }

    // Find function end (look for next function or end markers)
    for (let i = position.line; i < lines.length; i++) {
      const lineText = lines[i].trim();
      if (
        lineText.match(/^[a-zA-Z_][a-zA-Z0-9_]*:/) ||
        lineText.includes('function') ||
        lineText.includes('.fn')
      ) {
        endLine = i - 1;
        break;
      }
    }

    return lines.slice(startLine, endLine + 1).join('\n');
  }

  private extractFunctionName(assemblyCode: string): string {
    // Extract function name from assembly
    const lines = assemblyCode.split('\n');
    for (const line of lines) {
      // Look for .fn directive
      const fnMatch = line.match(/\.fn\s+(\w+)/);
      if (fnMatch) {
        return fnMatch[1];
      }

      // Look for function labels
      const labelMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
      if (labelMatch) {
        return labelMatch[1];
      }
    }
    return 'decompiled_function';
  }

  private async showDecompilationResults(
    result: DecompilationResult
  ): Promise<void> {
    // Create a new document with the generated C code
    const document = await vscode.workspace.openTextDocument({
      content: result.cCode,
      language: 'c',
    });

    await vscode.window.showTextDocument(document);

    // Show verification status
    if (result.status === 'success') {
      vscode.window.showInformationMessage(
        `Decompilation completed successfully! (${result.matchPercentage}% match)`
      );
    } else {
      vscode.window.showWarningMessage(
        'Decompilation completed with verification issues'
      );
    }
  }

  private async showVerificationResults(
    verificationResult: any
  ): Promise<void> {
    if (verificationResult.success) {
      vscode.window.showInformationMessage(
        'Verification passed! Decompilation is correct.'
      );
    } else {
      vscode.window.showWarningMessage(
        'Verification failed. Decompilation may need refinement.'
      );

      // Show detailed diff if available
      if (verificationResult.diff) {
        const document = await vscode.workspace.openTextDocument({
          content: verificationResult.diff,
          language: 'diff',
        });
        await vscode.window.showTextDocument(document);
      }
    }
  }

  dispose(): void {
    this.logger.info('Disposing DAITKDecompilerProvider');
  }
}
