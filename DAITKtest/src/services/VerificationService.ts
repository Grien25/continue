import { z } from 'zod';
import { Logger } from '../utils/Logger.js';

const VerificationResult = z.object({
  success: z.boolean(),
  matchPercentage: z.number().min(0).max(100).optional(),
  differences: z.array(z.string()).optional(),
  diff: z.string().optional(),
  objectFile1: z.string().optional(),
  objectFile2: z.string().optional(),
});

export type VerificationResult = z.infer<typeof VerificationResult>;

export class VerificationService {
  private logger: Logger;
  private objdiffPath: string;

  constructor() {
    this.logger = new Logger('VerificationService');
    this.objdiffPath = this.getObjdiffPath();
  }

  private getObjdiffPath(): string {
    return process.env.DAITK_OBJDIFF_PATH || 'objdiff';
  }

  async verifyDecompilation(
    assemblyCode: string,
    cCode: string,
    compilationResult: any
  ): Promise<VerificationResult> {
    this.logger.info('Verifying decompilation', {
      assemblyLength: assemblyCode.length,
      cCodeLength: cCode.length,
      compilationSuccess: compilationResult.success,
    });

    try {
      // For now, return a mock implementation
      // In a real implementation, this would use objdiff to compare object files
      const mockResult = await this.mockVerification(
        assemblyCode,
        cCode,
        compilationResult
      );

      this.logger.info('Verification completed', {
        success: mockResult.success,
        matchPercentage: mockResult.matchPercentage,
      });

      return mockResult;
    } catch (error) {
      this.logger.error('Verification failed:', error);
      return {
        success: false,
        differences: [
          `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  private async mockVerification(
    assemblyCode: string,
    cCode: string,
    compilationResult: any
  ): Promise<VerificationResult> {
    // Simulate verification time
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Mock verification logic
    const hasValidCompilation = compilationResult.success;
    const hasValidCCode = cCode.includes('{') && cCode.includes('}');
    const hasFunctionName =
      this.extractFunctionName(assemblyCode) !== 'decompiled_function';

    if (!hasValidCompilation) {
      return {
        success: false,
        matchPercentage: 0,
        differences: ['Compilation failed'],
        diff: 'Compilation errors prevent verification',
      };
    }

    if (!hasValidCCode) {
      return {
        success: false,
        matchPercentage: 10,
        differences: ['Invalid C code structure'],
        diff: 'Generated C code lacks proper function structure',
      };
    }

    // Simulate partial match for demonstration
    const matchPercentage = hasFunctionName ? 85 : 60;
    const isExactMatch = matchPercentage > 90;

    if (isExactMatch) {
      return {
        success: true,
        matchPercentage: 100,
        differences: [],
        objectFile1: 'original.o',
        objectFile2: 'decompiled.o',
      };
    } else {
      return {
        success: false,
        matchPercentage,
        differences: [
          'Stack frame differences detected',
          'Register allocation mismatch',
          'Instruction ordering variations',
        ],
        diff: this.generateMockDiff(),
        objectFile1: 'original.o',
        objectFile2: 'decompiled.o',
      };
    }
  }

  private extractFunctionName(assemblyCode: string): string {
    const lines = assemblyCode.split('\n');
    for (const line of lines) {
      const match = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):/);
      if (match) {
        return match[1];
      }
    }
    return 'decompiled_function';
  }

  private generateMockDiff(): string {
    return `--- original.o
+++ decompiled.o
@@ -1,5 +1,5 @@
- 00000000: 9421fff0  stwu r1,-16(r1)
- 00000004: 7c0802a6  mflr r0
- 00000008: 90010014  stw r0,20(r1)
+ 00000000: 9421fff0  stwu r1,-16(r1)
+ 00000004: 7c0802a6  mflr r0
+ 00000008: 90010014  stw r0,20(r1)
  0000000c: 48000001  bl 0x10
  00000010: 80010014  lwz r0,20(r1)
`;
  }

  async compareObjectFiles(
    file1: string,
    file2: string
  ): Promise<VerificationResult> {
    this.logger.info('Comparing object files', { file1, file2 });

    try {
      // In a real implementation, this would call objdiff
      const { exec } = await import('child_process');
      const { promisify } = await import('util');
      const execAsync = promisify(exec);

      const command = `${this.objdiffPath} "${file1}" "${file2}"`;
      const { stdout, stderr } = await execAsync(command);

      if (stderr) {
        return {
          success: false,
          differences: stderr.split('\n').filter((line) => line.trim()),
        };
      }

      // Parse objdiff output
      const isExactMatch =
        stdout.includes('identical') || stdout.includes('match');
      const matchPercentage = this.parseMatchPercentage(stdout);

      return {
        success: isExactMatch,
        matchPercentage,
        differences: isExactMatch ? [] : ['Object files differ'],
        diff: stdout,
        objectFile1: file1,
        objectFile2: file2,
      };
    } catch (error) {
      this.logger.error('Object file comparison failed:', error);
      return {
        success: false,
        differences: [
          `Comparison failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        ],
      };
    }
  }

  private parseMatchPercentage(output: string): number {
    // Parse match percentage from objdiff output
    const match = output.match(/(\d+)%/);
    return match ? parseInt(match[1]) : 0;
  }

  async generateVerificationReport(
    results: VerificationResult[]
  ): Promise<string> {
    this.logger.info('Generating verification report', {
      resultCount: results.length,
    });

    let report = '# DAITK Decompilation Verification Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    report += `## Summary\n`;
    report += `- Total functions: ${results.length}\n`;
    report += `- Successful verifications: ${successful.length}\n`;
    report += `- Failed verifications: ${failed.length}\n`;
    report += `- Success rate: ${((successful.length / results.length) * 100).toFixed(1)}%\n\n`;

    if (failed.length > 0) {
      report += `## Failed Verifications\n\n`;
      failed.forEach((result, index) => {
        report += `### Function ${index + 1}\n`;
        report += `- Match percentage: ${result.matchPercentage || 0}%\n`;
        if (result.differences) {
          report += `- Issues:\n`;
          result.differences.forEach((diff) => {
            report += `  - ${diff}\n`;
          });
        }
        report += `\n`;
      });
    }

    return report;
  }
}
