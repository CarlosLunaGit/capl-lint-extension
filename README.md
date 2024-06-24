# capl-lint README

The extension "capl-lint", allows you to manage your CAPL code analysis, view results, and customize your linting preferences.

Feedback and new features please contact us at: aess.technologies@gmail.com

:)

## Features

* Static code analisys for detection of:
    1. Missing # for Include's statements
    2. Not allowed statements within INCLUDES Block
    3. Not allowed statements within VARIABLES Block
    4. Missing semicolons for Line statements
    5. Duplicated variables declaration (Work in progress)
    6. Declaration of local VARIABLES not at the beginning portion of a FUNCTION (Work in progress)
    7. Missing comma to separate PARAMETERS in function declaration (Work in progress)
    8. Wrong FUNCTION declaration types (Work in progress)

## Examples

1. **Missing # for Include's statements**

```cpp
1.  includes
2.  {
3.      // Comment statement
4.      #include "..\\TestLibraries\\responses.cin"
5.       include "..\\TestLibraries\\utils.cin"
6.  }
```

Errors:
* line: 5, error: 'ERROR: On statement \"include \"..\\TestLibraries\\utils.cin\"\" (expecting \"#\")'

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
* line: 6, error: 'ERROR: On statement \"byte variable1[3]={0x01,0x02,0x03};\" (unexpected \"statement, only \"#include\" statements are allowed within the Include blocks\")'

---
3. **Not allowed statements within VARIABLES Block**

```cpp
1.  variables
2.    {
3.        byte variable1[3]={0x01,0x02,0x03};
4.        // Comment
5.        byte variable2[3]={0x04,0x05,0x06};
6.        int x = 10;
7.        int y = 20;
8.        #include "..\\myLibraries\\utils.cin"
9.    }
```

Errors:
* line: 8, error: 'ERROR: On statement "#include "..\\myLibraries\\utils.cin"" (unexpected "statement, only variables definitions and initializations are allowed within the Variable block")''

---
4. **Missing semicolons for Line statements**

```cpp
1.  variables
2.        {
3.            byte variable1[3]={0x01,0x02,0x03};
4.            // Missing semicolon in Variables Block
5.            byte variable2[3]={0x04,0x05,0x06}
6.            int w = 10;
7.            int x = 10;
8.            int y = 20;
9.        }
10. void MainTest ()
11.       {
12.           int z;
13.           z = x + y;
14.           // some comments
15.           if (1){
16.               write("%d",z);
17.               // Missing semicolon in Line Statement
18.               write("%d",w)
19.           }
20.	      }
```

Errors:
* line: 5, error: 'ERROR: On statement \"byte variable2[3]={0x04,0x05,0x06}\" (expecting ";")'
* line: 18, error: 'ERROR: On statement \"write(\"%d\",w)\" (expecting ";")'

---
4. **Duplicated variables declaration (Scoped to the active file)** (Work in progress)

```cpp
1.  variables
2.        {
3.            byte variable1[3]={0x01,0x02,0x03};
4.            int x = 10;
5.            int y = 10;
6.            int z = 20;
7.        }
8.        void MainTest ()
9.        {
10.            int z;
11.            z = x + y;
12.
13.            write("%d",z);
14.
15.	      }
```

Errors:
* line: 10, error: 'TBD'

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

### 0.0.5/6

* General Bug's fixes on Tokenizer logic

---
