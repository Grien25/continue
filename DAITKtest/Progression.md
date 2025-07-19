# DAITK AI Decompiler VS Code Extension Progression

This document outlines the incremental steps for building the AI-assisted decompiler VS Code extension. The goal is to create a VS Code extension that helps developers decompile assembly code to C using AI assistance, with built-in verification and refinement capabilities.

## Stage 1 – Extension Foundation & Setup

### Core Extension Structure

- Set up VS Code extension development environment with TypeScript
- Create extension manifest (`package.json`) with proper activation events
- Implement basic extension activation and deactivation
- Add extension commands and keybindings
- Create extension configuration schema

### Assembly File Integration

- Add support for `.s` assembly files with syntax highlighting
- Implement file watchers for `asm/` folders
- Create assembly file explorer in VS Code sidebar
- Add assembly function parsing and navigation
- Implement assembly-to-C conversion command palette

### Development Environment

- Set up Metrowerks CodeWarrior PPC compiler integration
- Configure `objdiff` for object file comparison
- Create `recomp_obj/`, `src/`, and `logs/` folder management
- Add project workspace configuration

## Stage 2 – AI-Powered Decompilation

### LLM Integration

- Integrate with OpenAI, Anthropic, or local LLM providers
- Create prompt engineering for assembly-to-C conversion
- Implement function-by-function decompilation pipeline
- Add progress tracking and status reporting
- Create decompilation queue management

### C Code Generation

- Generate C code for each assembly function
- Implement template-based C code generation
- Add C syntax highlighting and IntelliSense
- Create C file organization and management
- Implement incremental decompilation

### Compilation Pipeline

- Automatically compile generated C using CodeWarrior
- Handle compilation errors and warnings
- Implement build output parsing and error reporting
- Add compilation status indicators in VS Code

## Stage 3 – Verification & Comparison

### Object File Comparison

- Integrate `objdiff` for automated comparison
- Compare generated object files against originals
- Implement diff visualization in VS Code
- Add verification status indicators
- Create verification report generation

### Match Tracking

- Track exact matches vs mismatches
- Implement verification database
- Add progress tracking for large projects
- Create verification statistics and reporting
- Implement batch verification workflows

### Error Analysis

- Analyze and categorize verification failures
- Implement failure pattern detection
- Add failure reporting and logging
- Create error classification system

## Stage 4 – Refinement & Iteration

### AI Prompt Refinement

- Implement prompt iteration based on verification results
- Add prompt versioning and A/B testing
- Create prompt optimization workflows
- Implement feedback loops for improvement

### Manual Intervention

- Add manual C code editing capabilities
- Implement diff-based editing suggestions
- Create manual verification workflows
- Add expert review and approval system

### Continuous Improvement

- Implement learning from successful decompilations
- Add pattern recognition for common structures
- Create automated prompt optimization
- Implement community-driven improvements

## Technical Architecture

### Extension Components

- **Core Extension**: Main VS Code integration
- **Assembly Parser**: Parse and analyze assembly files
- **AI Service**: LLM integration and prompt management
- **Compiler Integration**: CodeWarrior compilation pipeline
- **Verification Engine**: Object file comparison and analysis
- **UI Components**: VS Code UI elements and views

### Key Features

- Assembly file browser with function navigation
- AI-powered assembly-to-C conversion
- Real-time compilation and verification
- Diff visualization and error reporting
- Progress tracking and status indicators
- Batch processing capabilities
- Community-driven prompt sharing

This progression transforms the command-line workflow into a comprehensive VS Code extension that provides an integrated development environment for AI-assisted decompilation.
