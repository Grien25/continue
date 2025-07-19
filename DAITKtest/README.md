# DAITK AI Decompiler VS Code Extension

A powerful VS Code extension for AI-assisted assembly to C decompilation with built-in verification and refinement capabilities.

## Features

### 🧠 AI-Powered Decompilation

- **Assembly to C Conversion**: Use AI to automatically convert assembly code to C
- **Multiple AI Providers**: Support for OpenAI, Anthropic, and local LLM models
- **Smart Function Detection**: Automatically detect and extract functions from assembly files
- **Context-Aware Generation**: AI considers surrounding code and function context

### 🔍 Assembly File Integration

- **Assembly File Browser**: Explore `.s` files in the VS Code sidebar
- **Function Navigation**: Browse and navigate functions within assembly files
- **Syntax Highlighting**: Full support for assembly language syntax
- **File Watching**: Automatic updates when assembly files change

### ✅ Verification & Comparison

- **Object File Comparison**: Compare generated C against original assembly using `objdiff`
- **Match Percentage**: Get detailed match percentages for decompilation accuracy
- **Diff Visualization**: View differences between original and decompiled code
- **Batch Verification**: Verify multiple functions at once

### 🛠️ Compilation Pipeline

- **Metrowerks CodeWarrior Integration**: Compile generated C code using PPC compiler
- **Error Reporting**: Detailed compilation error analysis
- **Build Status**: Real-time compilation status indicators
- **Object File Management**: Automatic object file generation and cleanup

### 📊 Progress Tracking

- **Decompilation Status**: Track verification results in the sidebar
- **Progress Indicators**: Visual progress tracking for long operations
- **Statistics Reporting**: Generate detailed verification reports
- **History Management**: Keep track of previous decompilation attempts

## Installation

### Prerequisites

- VS Code 1.85.0 or higher
- Node.js 18.0.0 or higher
- Metrowerks CodeWarrior compiler (for PPC compilation)
- objdiff tool (for object file comparison)

### Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd DAITKtest
```

2. Install dependencies:

```bash
npm install
```

3. Build the extension:

```bash
npm run build
```

4. Package the extension:

```bash
npm run package
```

5. Install the VSIX file in VS Code:
   - Open VS Code
   - Go to Extensions (Ctrl+Shift+X)
   - Click the "..." menu and select "Install from VSIX..."
   - Select the generated `.vsix` file

## Configuration

### Environment Variables

Set up your environment variables in VS Code settings:

```json
{
  "daitk.apiKey": "your-api-key-here",
  "daitk.modelProvider": "openai",
  "daitk.compilerPath": "/path/to/mwcceppc",
  "daitk.objdiffPath": "/path/to/objdiff"
}
```

### Extension Settings

- `daitk.apiKey`: API key for AI service (OpenAI, Anthropic, etc.)
- `daitk.modelProvider`: AI model provider (`openai`, `anthropic`, `local`)
- `daitk.compilerPath`: Path to Metrowerks CodeWarrior compiler
- `daitk.objdiffPath`: Path to objdiff tool for object file comparison

## Usage

### Basic Workflow

1. **Open Assembly File**: Open a `.s` assembly file in VS Code
2. **Navigate Functions**: Use the Assembly Functions sidebar to browse functions
3. **Decompile Function**:
   - Select a function in the assembly file
   - Use Command Palette: `DAITK: Decompile Function`
   - Or right-click and select "Decompile Function"
4. **Review Generated C**: The generated C code opens in a new tab
5. **Verify Decompilation**: Use `DAITK: Verify Decompilation` to check accuracy
6. **Refine if Needed**: Edit the C code and re-verify as needed

### Commands

- **`DAITK: Decompile Function`**: Decompile the currently selected function
- **`DAITK: Verify Decompilation`**: Verify the current C file against original assembly
- **`DAITK: Open Assembly Explorer`**: Open the assembly file browser

### Sidebar Views

- **Assembly Functions**: Browse assembly files and functions
- **Decompilation Status**: Track verification results and progress

## Development

### Project Structure

```
DAITKtest/
├── src/
│   ├── extension.ts              # Main extension entry point
│   ├── providers/                # VS Code tree data providers
│   │   ├── DAITKDecompilerProvider.ts
│   │   ├── AssemblyExplorerProvider.ts
│   │   └── DecompilationStatusProvider.ts
│   ├── services/                 # Core business logic
│   │   ├── AIService.ts         # AI integration
│   │   ├── CompilerService.ts   # Compilation pipeline
│   │   └── VerificationService.ts # Object file comparison
│   ├── utils/                    # Utility functions
│   │   └── Logger.ts
│   └── types/                    # TypeScript type definitions
├── resources/                    # Extension resources
│   └── icon.svg
├── package.json                  # Extension manifest
└── language-configuration.json   # Assembly language support
```

### Development Commands

```bash
# Build the extension
npm run build

# Watch for changes
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Format code
npm run format

# Package extension
npm run package
```

## Architecture

### Core Components

1. **Extension Activation**: Handles VS Code extension lifecycle
2. **Assembly Parser**: Parses and analyzes assembly files
3. **AI Service**: Integrates with LLM providers for code generation
4. **Compiler Integration**: Manages CodeWarrior compilation pipeline
5. **Verification Engine**: Compares object files using objdiff
6. **UI Components**: VS Code UI elements and views

### Data Flow

1. **Assembly Input** → Assembly file parsing and function extraction
2. **AI Processing** → LLM generates C code from assembly
3. **Compilation** → CodeWarrior compiles generated C code
4. **Verification** → objdiff compares object files
5. **Feedback Loop** → Results inform refinement and improvement

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

Apache 2.0 - see LICENSE file for details.

## Roadmap

### Stage 1 - Foundation ✅

- [x] VS Code extension structure
- [x] Assembly file integration
- [x] Basic AI service integration
- [x] Compilation pipeline setup

### Stage 2 - AI Integration 🚧

- [ ] Real AI model integration
- [ ] Advanced prompt engineering
- [ ] Context-aware generation
- [ ] Batch processing

### Stage 3 - Verification 🚧

- [ ] Real objdiff integration
- [ ] Advanced diff visualization
- [ ] Verification database
- [ ] Progress tracking

### Stage 4 - Refinement 🚧

- [ ] AI prompt refinement
- [ ] Manual intervention tools
- [ ] Community-driven improvements
- [ ] Advanced analytics
