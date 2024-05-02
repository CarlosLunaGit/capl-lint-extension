# capl-lint README

The extension "capl-lint", allows you to manage your CAPL code analysis, view results, and customize your linting preferences.

Feedback and new features please contact us at: aess.technologies@gmail.com

:)

## Features

* Static code analisys for detection of:
    1. Missing semicolons for VARIABLES declaration
    2. Not allowed statements within INCLUDES Block
    3. Not allowed statements within VARIABLES Block
    4. Declaration of local VARIABLES not at the beginning portion of a FUNCTION
    5. Missing comma to separate PARAMETERS in function declaration
    6. Wrong FUNCTION declaration types

## Examples

1. **Missing semicolons for Variables declaration**

```cpp
1.  variables
2.    {
3.        byte variable1[3]={0x01,0x02,0x03};
4.        byte variable2[3]={0x04,0x05,0x06}
5.        int x = 10;
6.        int y = 20
7.    }
```

Errors:
* line: 4, error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte variable2[3]={0x04,0x05,0x06}'
* line: 6, error: 'Variable declaration should end with a semicolon. Statement: - int y = 20'

---
2. **Not allowed statements within INCLUDES Block**

```cpp
1.  includes
2.  {
3.      // Comment statement
4.      #include "..\\TestLibraries\\responses.cin"
5.      #include "..\\TestLibraries\\utils.cin"
6.      byte variable1[3]={0x01,0x02,0x03};
7.  }
```

Errors:
* line: 6, error: 'INCLUDES Block can only host lines of type = ["//", "*", "*/", "#include"...]. Statement: - byte variable1[3]={0x01,0x02,0x03};'

---
3. **Not allowed statements within VARIABLES Block**

```cpp
1.  variables
2.    {
3.        byte variable1[3]={0x01,0x02,0x03};
4.        // Comment
5.        byte variable2[3]={0x04,0x05,0x06}
6.        int x = 10;
7.        int y = 20
8.        #include "..\\myLibraries\\utils.cin"
9.    }
```

Errors:
* line: 5, error: 'Variable Declaration BLOCK should end with a semicolon. Statement: - byte variable2[3]={0x04,0x05,0x06}'
* line: 7, error: 'Variable declaration should end with a semicolon. Statement: - int y = 20'
* line: 8, error: 'VARIABLES Block can only host lines of type = ["//", "*", "*/", "variables"...]. Statement: - #include "..\\myLibraries\\utils.cin"'

---

## Requirements

None

## Extension Settings

This extension contributes the following settings:

* `capl-linter.lint`: Triggers the linter onto the current active editor file.

## Known Issues

    - Please report any issues to aess.technologies@gmail.com

## Release Notes

### 0.0.1

* Initial release of the extension with basic features and no customizable settings.

---

### 0.0.4

* Adds support for detection of comma separated parameters in Functions.
* Adds support for detection for wrong function declaration types.
* Fixes bugs for detecting missing semicolons in Multi-line cases.

---
