#!/usr/bin/env node

// Test script to demonstrate DAITK decompilation functionality
const fs = require('fs');
const path = require('path');

// Mock the VS Code API for testing
const mockVscode = {
  window: {
    showInformationMessage: (msg) => console.log('✅', msg),
    showWarningMessage: (msg) => console.log('⚠️', msg),
    showErrorMessage: (msg) => console.log('❌', msg),
    withProgress: async (options, task) => {
      console.log('🔄 Starting:', options.title);
      return await task({
        report: (progress) => {
          console.log(
            `📊 Progress: ${progress.message || ''} (${progress.increment || 0}%)`
          );
        },
      });
    },
  },
  workspace: {
    openTextDocument: async (options) => ({
      getText: () => options.content || '',
      languageId: options.language || 'text',
    }),
    asRelativePath: (uri) => uri.fsPath.split('/').pop(),
  },
  Uri: {
    file: (path) => ({ fsPath: path }),
  },
  Range: class {
    constructor(start, end) {
      this.start = start;
      this.end = end;
    }
  },
  Position: class {
    constructor(line, character) {
      this.line = line;
      this.character = character;
    }
  },
};

// Mock the services
class MockAIService {
  async generateCCode(assemblyCode) {
    console.log('🤖 AI Service: Generating C code from assembly...');

    // Extract function name
    const functionMatch = assemblyCode.match(/\.fn\s+(\w+)/);
    const functionName = functionMatch ? functionMatch[1] : 'unknown_function';

    // Generate mock C code based on the memcpy function
    const cCode = `// Generated C code for ${functionName}
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void* ${functionName}(void* dest, const void* src, size_t n) {
    // This is a decompiled version of the memcpy function
    // Original assembly was optimized for PowerPC architecture
    
    if (n == 0) return dest;
    
    // Handle overlapping memory regions
    if (src < dest && (char*)src + n > (char*)dest) {
        // Copy from end to beginning to avoid overwriting
        char* d = (char*)dest + n - 1;
        const char* s = (const char*)src + n - 1;
        while (n--) *d-- = *s--;
    } else {
        // Normal copy from beginning to end
        char* d = (char*)dest;
        const char* s = (const char*)src;
        while (n--) *d++ = *s++;
    }
    
    return dest;
}

// Test function
int main() {
    char src[] = "Hello, World!";
    char dest[20];
    
    ${functionName}(dest, src, strlen(src) + 1);
    printf("Copied: %s\\n", dest);
    
    return 0;
}`;

    console.log('✅ AI Service: C code generated successfully');
    return cCode;
  }
}

class MockCompilerService {
  async compileCCode(cCode) {
    console.log('🔨 Compiler Service: Compiling C code...');

    // Mock compilation result
    return {
      success: true,
      outputPath: '/tmp/compiled.o',
      objectFile: 'compiled.o',
      warnings: ['No main function found in some files'],
    };
  }
}

class MockVerificationService {
  async verifyDecompilation(assemblyCode, cCode, compilationResult) {
    console.log('🔍 Verification Service: Verifying decompilation...');

    // Mock verification result
    return {
      success: true,
      matchPercentage: 85,
      differences: ['Some register optimizations differ'],
      objectFile1: 'original.o',
      objectFile2: 'decompiled.o',
    };
  }
}

// Main test function
async function testDecompilation() {
  console.log('🚀 Starting DAITK Decompilation Test\n');

  try {
    // Read the assembly file
    const assemblyFile = path.join(
      __dirname,
      'test',
      'auto_00_80004000_init.s'
    );
    const assemblyCode = fs.readFileSync(assemblyFile, 'utf8');

    console.log('📁 Assembly file loaded:', assemblyFile);
    console.log('📏 File size:', assemblyCode.length, 'characters');

    // Extract the memcpy function (first function in the file)
    const memcpyStart = assemblyCode.indexOf('.fn memcpy');
    const nextFunction = assemblyCode.indexOf('.fn', memcpyStart + 1);
    const memcpyCode = assemblyCode.substring(
      memcpyStart,
      nextFunction > 0 ? nextFunction : assemblyCode.length
    );

    console.log('🔍 Extracted memcpy function');
    console.log('📏 Function size:', memcpyCode.length, 'characters\n');

    // Initialize services
    const aiService = new MockAIService();
    const compilerService = new MockCompilerService();
    const verificationService = new MockVerificationService();

    // Step 1: Generate C code using AI
    console.log('🔄 Step 1: AI Code Generation');
    const cCode = await aiService.generateCCode(memcpyCode);
    console.log('✅ C code generated successfully\n');

    // Step 2: Compile the generated C code
    console.log('🔄 Step 2: Compilation');
    const compilationResult = await compilerService.compileCCode(cCode);
    console.log('✅ Compilation completed\n');

    // Step 3: Verify the decompilation
    console.log('🔄 Step 3: Verification');
    const verificationResult = await verificationService.verifyDecompilation(
      memcpyCode,
      cCode,
      compilationResult
    );
    console.log('✅ Verification completed\n');

    // Display results
    console.log('📊 Results:');
    console.log('  - Compilation success:', compilationResult.success);
    console.log('  - Verification success:', verificationResult.success);
    console.log(
      '  - Match percentage:',
      verificationResult.matchPercentage + '%'
    );

    if (verificationResult.differences) {
      console.log(
        '  - Differences found:',
        verificationResult.differences.length
      );
    }

    console.log('\n🎉 Decompilation test completed successfully!');
    console.log('\n📝 Generated C code preview:');
    console.log('─'.repeat(50));
    console.log(cCode.substring(0, 500) + '...');
    console.log('─'.repeat(50));
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDecompilation();
