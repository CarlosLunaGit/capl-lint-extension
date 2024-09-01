# capl-lint README

The extension "capl-lint", allows you to manage your CAPL code analysis, view results, and customize your linting preferences.

Feedback and new features please contact us at: aess.technologies@gmail.com

:)

## User interface

<img src="https://github.com/CarlosLunaGit/capl-lint-extension/blob/master/images/UserInterface.png?raw=true" width="-webkit-fill-available">

## Features

* Static code analisys for detection of:
    1. [Missing # for Include's statements](#anchor-1)
    2. [Not allowed statements within INCLUDES Block](#anchor-2)
    3. [Not allowed statements within VARIABLES Block](#anchor-3)
    4. [Missing semicolons for Line statements](#anchor-4)
    5. [Duplicated variables declaration](#anchor-5)
    6. [Overwriting variable initialized values](#anchor-6)
    7. [Declaration of local VARIABLES not at the beginning portion of a FUNCTION](#anchor-7)
    8. Missing comma to separate PARAMETERS in function declaration (Work in progress)
    9. Wrong FUNCTION declaration types (Work in progress)
    10. Parse errors
        * Unexpected literals

* Include Files explorer
    1. [Shows the current's file dependencies in the explorer view](#anchor-8)

## Usage

Just trigger the extension while having an active file, it will take the active file and perform the analysis for you.

<img src="https://github.com/CarlosLunaGit/capl-lint-extension/blob/master/images/triggering-extension.gif?raw=true" width="-webkit-fill-available">

## Examples

1. <h3 id="anchor-1">Missing # for Include's statements</h3>

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
2. <h3 id="anchor-2">Not allowed statements within INCLUDES Block</h3>

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
3. <h3 id="anchor-3">Not allowed statements within VARIABLES Block</h3>

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
4. <h3 id="anchor-4">Missing semicolons for Line statements</h3>

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
5. <h3 id="anchor-5">Duplicated variables declaration (Scoped to the active file)</h3>

```cpp
1.  variables
2.        {
3.            byte variable1[3]={0x01,0x02,0x03};
4.            int x = 10;
5.            int y = 10;
6.            int z = 20;
7.        }
8.  void MainTest ()
9.        {
10.            int localVar1;
11.            int localVar1;// Duplicated variable
12.            z = x + y;
13.
14.            write("%d",z);
15.
16.	      }
```

Errors:
* line: 11, error: 'ERROR: Variable already declared at the same local scope at row 10'

---
6. <h3 id="anchor-6">Overwriting variable initialized values (Scoped to the active file)</h3>

```cpp
1.  variables
2.        {
3.            byte variable1[3]={0x01,0x02,0x03};
4.            int x = 10;
5.            int y = 10;
6.            int z = 20;
7.        }
8.  void MainTest ()
9.        {
10.            int z; // Duplicated variable
11.            z = x + y;
12.
13.            write("%d",z);
14.
15.	      }
```

Errors:
* line: 10, error: 'WARNING: Variable value initialized at row 6 will be overwritten by the new value at row 10. Statement: - int z;'

---
7. <h3 id="anchor-7">Declaration of local VARIABLES not at the beginning portion of a FUNCTION</h3>

```cpp
1.  /*@!Encoding:1252*/
2.        includes
3.        {
4.
5.        }
6.
7.        variables {
8.
9.        }
10.
11.        void MainTest ()
12.        {
13.            int x = 10;
14.            int y = 20;
15.            int z;
16.
17.            z = x + y;
18.
19.            // A comment statement
20.            if (1){
21.            write("%d",z);
22.                int w = 10; // Error here
23.                write("%d",w);
24.            }
25.
26.        }
```

Errors:
* line: 22, error: 'ERROR: On statement \"int w = 10;\" (unexpected \"Declaration of local VARIABLES must happen at the beginning of a FUNCTION block\")'

---
8. <h3 id="anchor-8">Shows the current's file dependencies in the explorer view</h3>

When a file becomes the "active file" the Explorer view will get updated with the list of INCLUDE files, there you can click the file name to quickly jump into it.

If the explorer view is closed, activate the view and collapse the INCLUDE FILES dropdown as shown below:

<img src="https://github.com/CarlosLunaGit/capl-lint-extension/blob/master/images/triggering-extension.gif?raw=true" width="-webkit-fill-available">


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

### 0.0.7

* General Bug's fixes on Tokenizer logic.

---

### 0.0.8

* Enabling link for Users Donations thru Stripe.

---

### 0.0.9

* Support for Variables not declared at the start of a block and duplicated variable declaration.
* Stats section on report (Shows only total number of errors)

---

### 0.0.12

* Adds WARNINGS error Types
* General Bugs fixing

---

### 0.0.14

* Adds INCLUDE FILES EXPLORER VIEW
* General Bugs fixing

---