#!/usr/bin/env node

// Demo script showing the sidebar decompilation results functionality
const fs = require('fs');
const path = require('path');

console.log('🎯 DAITK Sidebar Demo - Decompilation Results\n');

// Mock decompilation results
const mockResults = [
  {
    id: 'decomp_1',
    functionName: 'memcpy',
    assemblyFile: 'test/auto_00_80004000_init.s',
    cCode: `// Generated C code for memcpy
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

void* memcpy(void* dest, const void* src, size_t n) {
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
}`,
    status: 'success',
    matchPercentage: 85,
    timestamp: new Date(),
    differences: ['Some register optimizations differ'],
  },
  {
    id: 'decomp_2',
    functionName: 'memset',
    assemblyFile: 'test/auto_00_80004000_init.s',
    cCode: `// Generated C code for memset
#include <string.h>

void* memset(void* dest, int c, size_t n) {
    unsigned char* d = (unsigned char*)dest;
    unsigned char value = (unsigned char)c;
    
    while (n--) {
        *d++ = value;
    }
    
    return dest;
}`,
    status: 'success',
    matchPercentage: 92,
    timestamp: new Date(Date.now() - 60000), // 1 minute ago
    differences: [],
  },
  {
    id: 'decomp_3',
    functionName: 'strcpy',
    assemblyFile: 'test/auto_00_80004000_init.s',
    cCode: `// Generated C code for strcpy
#include <string.h>

char* strcpy(char* dest, const char* src) {
    char* d = dest;
    const char* s = src;
    
    while ((*d++ = *s++) != '\\0') {
        // Copy until null terminator
    }
    
    return dest;
}`,
    status: 'warning',
    matchPercentage: 78,
    timestamp: new Date(Date.now() - 120000), // 2 minutes ago
    differences: [
      'Stack frame differences detected',
      'Register allocation mismatch',
    ],
  },
];

// Display the sidebar structure
console.log('📋 Sidebar Structure:');
console.log('┌─ DAITK Decompiler');
console.log('├─ Assembly Functions');
console.log('│  └─ auto_00_80004000_init.s');
console.log('│     ├─ memcpy');
console.log('│     ├─ memset');
console.log('│     └─ strcpy');
console.log('├─ Decompilation Results');
console.log('│  ├─ ✅ memcpy (85%)');
console.log('│  │  ├─ 📄 Generated C Code');
console.log('│  │  ├─ ✅ Verification: 85% match');
console.log('│  │  └─ ⚠️  Differences (1)');
console.log('│  ├─ ✅ memset (92%)');
console.log('│  │  ├─ 📄 Generated C Code');
console.log('│  │  └─ ✅ Verification: 92% match');
console.log('│  └─ ⚠️  strcpy (78%)');
console.log('│     ├─ 📄 Generated C Code');
console.log('│     ├─ ⚠️  Verification: 78% match');
console.log('│     └─ ⚠️  Differences (2)');
console.log('└─ Decompilation Status');
console.log('   ├─ 📊 Total: 3 functions');
console.log('   ├─ ✅ Success: 2');
console.log('   └─ ⚠️  Warnings: 1\n');

// Show detailed results
console.log('📊 Detailed Results:');
mockResults.forEach((result, index) => {
  console.log(
    `\n${index + 1}. ${result.functionName} (${result.matchPercentage}% match)`
  );
  console.log(`   📁 File: ${result.assemblyFile}`);
  console.log(`   🕒 Time: ${result.timestamp.toLocaleTimeString()}`);
  console.log(
    `   📊 Status: ${result.status === 'success' ? '✅ Success' : '⚠️ Warning'}`
  );

  if (result.differences && result.differences.length > 0) {
    console.log(`   ⚠️  Issues:`);
    result.differences.forEach((diff) => {
      console.log(`      - ${diff}`);
    });
  }

  console.log(`   📝 C Code Preview:`);
  const preview = result.cCode.split('\n').slice(0, 5).join('\n');
  console.log(`      ${preview.replace(/\n/g, '\n      ')}...`);
});

console.log('\n🎯 Interactive Features:');
console.log('• Click on "Generated C Code" to open the full C file');
console.log('• Click on "Verification" to see detailed match info');
console.log('• Click on "Differences" to see what needs fixing');
console.log('• Use "DAITK: Clear Results" to clear the sidebar');
console.log('• Results are automatically added when you decompile functions');

console.log('\n🚀 How to Use:');
console.log('1. Open an assembly file (.s)');
console.log('2. Position cursor on a function');
console.log('3. Use "DAITK: Decompile Function"');
console.log('4. Check the sidebar for results!');

console.log('\n✨ Benefits:');
console.log('• Real-time decompilation results');
console.log('• Visual progress tracking');
console.log('• Easy access to generated C code');
console.log('• Verification status at a glance');
console.log('• History of all decompilation attempts');
