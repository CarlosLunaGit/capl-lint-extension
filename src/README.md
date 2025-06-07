# Project SRC Subdirectory
## src/

### Overview

This directory contains the source code for the CAPL Lint extension. The main components include:

- **commands/**: Commands registration logic
- **providers/**: Tree view and other providers
- **utils/**: Utility functions
- **views/**: Webview HTML and related logic
- **types/**: Type definitions and interfaces
- **test/**: Unit and integration tests
- **extension.ts**: Main entry point for the extension
- **lint.ts**: Core linting logic

#### commands/
* This directory should contain files that define and register commands for the extension. Commands are the actions users can trigger via the Command Palette or UI elements.

#### providers/
* This directory should contain classes that implement VS Code's TreeDataProvider or other provider interfaces. These are used to populate custom views in the Explorer or other UI elements.