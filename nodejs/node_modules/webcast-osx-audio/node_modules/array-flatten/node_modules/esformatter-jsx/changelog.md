
# esformatter-jsx - Changelog
## v2.3.11
- **Build Scripts Changes**
  - upgrade babel-core. Fix [#38](https://github.com/royriojas/esformatter-jsx/issues/38) - [4d75188]( https://github.com/royriojas/esformatter-jsx/commit/4d75188 ), [royriojas](https://github.com/royriojas), 14/11/2015 19:54:55

    
- **Bug Fixes**
  - Remove non npm dependencies. Fixes [#40](https://github.com/royriojas/esformatter-jsx/issues/40) - [0ab0a2a]( https://github.com/royriojas/esformatter-jsx/commit/0ab0a2a ), [royriojas](https://github.com/royriojas), 14/11/2015 18:53:02

    
## v2.3.10
- **Bug Fixes**
  - Properly format code that contains a Bind Expression. Fixes [#39](https://github.com/royriojas/esformatter-jsx/issues/39) - [5e3f334]( https://github.com/royriojas/esformatter-jsx/commit/5e3f334 ), [royriojas](https://github.com/royriojas), 13/11/2015 03:42:14

    
  - tab indentation. Fixes [#36](https://github.com/royriojas/esformatter-jsx/issues/36) - [73e5526]( https://github.com/royriojas/esformatter-jsx/commit/73e5526 ), [Lukas Benes](https://github.com/Lukas Benes), 01/11/2015 15:06:51

    
## v2.3.9
- **Bug Fixes**
  - properly support export declarations, even the ones that babel allows. Fixes [#34](https://github.com/royriojas/esformatter-jsx/issues/34) - [cc69735]( https://github.com/royriojas/esformatter-jsx/commit/cc69735 ), [royriojas](https://github.com/royriojas), 29/10/2015 10:05:29

    
  - support inline decorators. Fixes [#35](https://github.com/royriojas/esformatter-jsx/issues/35) - [97e4a28]( https://github.com/royriojas/esformatter-jsx/commit/97e4a28 ), [royriojas](https://github.com/royriojas), 29/10/2015 09:02:51

    
## v2.3.8
- **Bug Fixes**
  - support async/await. Fixes [#33](https://github.com/royriojas/esformatter-jsx/issues/33) - [20d4686]( https://github.com/royriojas/esformatter-jsx/commit/20d4686 ), [royriojas](https://github.com/royriojas), 26/10/2015 20:29:51

    
## v2.3.7
- **Bug Fixes**
  - support async/await - [9e06f36]( https://github.com/royriojas/esformatter-jsx/commit/9e06f36 ), [royriojas](https://github.com/royriojas), 26/10/2015 19:21:21

    
## v2.3.6
- **Bug Fixes**
  - require acorn only if no other parser was set. Fixes [#31](https://github.com/royriojas/esformatter-jsx/issues/31) - [4ae4479]( https://github.com/royriojas/esformatter-jsx/commit/4ae4479 ), [royriojas](https://github.com/royriojas), 11/10/2015 10:55:10

    
## v2.3.5
- **Bug Fixes**
  - properly format ES7 Decorators. Fixes [#29](https://github.com/royriojas/esformatter-jsx/issues/29) - [8f124fd]( https://github.com/royriojas/esformatter-jsx/commit/8f124fd ), [royriojas](https://github.com/royriojas), 08/10/2015 11:43:53

    
- **Build Scripts Changes**
  - Update esformatter-ignore to latest to properly ignore lines that have no empty spaces at the beginning - [e0ce5f3]( https://github.com/royriojas/esformatter-jsx/commit/e0ce5f3 ), [royriojas](https://github.com/royriojas), 08/10/2015 11:32:31

    
## v2.3.4
- **Bug Fixes**
  - support `ExportNamedDeclaration`. Fixes [#28](https://github.com/royriojas/esformatter-jsx/issues/28) - [b968dbf]( https://github.com/royriojas/esformatter-jsx/commit/b968dbf ), [royriojas](https://github.com/royriojas), 06/10/2015 17:39:36

    
## v2.3.3
- **Bug Fixes**
  - Issue with the parser returning negative indexes - [eafe7bf]( https://github.com/royriojas/esformatter-jsx/commit/eafe7bf ), [royriojas](https://github.com/royriojas), 02/10/2015 00:13:17

    
## v2.3.2
- **Features**
  - Support SpreadProperties outside of JSX blocks. Fixes [#27](https://github.com/royriojas/esformatter-jsx/issues/27) - [2ad355d]( https://github.com/royriojas/esformatter-jsx/commit/2ad355d ), [royriojas](https://github.com/royriojas), 01/10/2015 23:34:20

    
## v2.3.1
- **Features**
  - Support for decorators and class properties. Fixes [#26](https://github.com/royriojas/esformatter-jsx/issues/26) - [8d546ef]( https://github.com/royriojas/esformatter-jsx/commit/8d546ef ), [royriojas](https://github.com/royriojas), 01/10/2015 23:02:16

    
## v2.3.0
- **Features**
  - support decorators and static props - [e6e1dc2]( https://github.com/royriojas/esformatter-jsx/commit/e6e1dc2 ), [royriojas](https://github.com/royriojas), 01/10/2015 22:25:39

    Please note that `static props` are just ignored from beautification all together for now
    
    It shouldn't be difficult to format it, but for now it is just OK
    
## v2.2.0
- **Refactoring**
  - use acorn-babel for more es6, es7 features - [6043e32]( https://github.com/royriojas/esformatter-jsx/commit/6043e32 ), [royriojas](https://github.com/royriojas), 01/10/2015 19:38:15

    
## v2.1.4
- **Enhancements**
  - properly ignore blocks with ignore block comments - [b8f5c52]( https://github.com/royriojas/esformatter-jsx/commit/b8f5c52 ), [royriojas](https://github.com/royriojas), 01/10/2015 10:24:18

    
## v2.1.3
- **Enhancements**
  - ignore blocks using esformatter-ignore - [460d6e8]( https://github.com/royriojas/esformatter-jsx/commit/460d6e8 ), [royriojas](https://github.com/royriojas), 30/09/2015 23:40:21

    Required because espree still does not recognize some of the new fancy syntax of ES6 and ES7 and that makes it break badly when trying to beautify new files
    
## v2.1.2
- **Bug Fixes**
  - wrong changelogx section - [a047b49]( https://github.com/royriojas/esformatter-jsx/commit/a047b49 ), [royriojas](https://github.com/royriojas), 21/09/2015 21:33:23

    
## v2.1.1
- **Enhancements**
  - support for spread operator - [b4a36d1]( https://github.com/royriojas/esformatter-jsx/commit/b4a36d1 ), [royriojas](https://github.com/royriojas), 17/09/2015 23:28:16

    
- **Documentation**
  - Update Readme. Fixes [#7](https://github.com/royriojas/esformatter-jsx/issues/7) - [323a2ec]( https://github.com/royriojas/esformatter-jsx/commit/323a2ec ), [Roy Riojas](https://github.com/Roy Riojas), 29/08/2015 23:40:01

    
## v2.1.0
- **Enhancements**
  - support for spread operator - [2c136b4]( https://github.com/royriojas/esformatter-jsx/commit/2c136b4 ), [royriojas](https://github.com/royriojas), 17/09/2015 23:26:41

    
## v2.0.11
- **Bug Fixes**
  - properly handle ObjectExpressions and ArrayExpressions inside JSXContainers - [53941aa]( https://github.com/royriojas/esformatter-jsx/commit/53941aa ), [royriojas](https://github.com/royriojas), 12/08/2015 00:46:59

    
## v2.0.10
- **Bug Fixes**
  - prevent other plugins from messing with the expression containers - [161de77]( https://github.com/royriojas/esformatter-jsx/commit/161de77 ), [royriojas](https://github.com/royriojas), 07/08/2015 11:26:51

    
## v2.0.9
- **Bug Fixes**
  - exclude identifiers from recursive formatting - [db23cd4]( https://github.com/royriojas/esformatter-jsx/commit/db23cd4 ), [royriojas](https://github.com/royriojas), 07/08/2015 00:16:39

    
## v2.0.8
- **Bug Fixes**
  - properly format JSXExpression containers content. Fixes [#14](https://github.com/royriojas/esformatter-jsx/issues/14) - [d8d21e7]( https://github.com/royriojas/esformatter-jsx/commit/d8d21e7 ), [royriojas](https://github.com/royriojas), 06/08/2015 23:54:59

    
## v2.0.7
- **Bug Fixes**
  - nested JSXElements inside JSXExpressionContainers now are properly beautified - [3ef3595]( https://github.com/royriojas/esformatter-jsx/commit/3ef3595 ), [royriojas](https://github.com/royriojas), 06/08/2015 17:35:14

    
## v2.0.6
- **Documentation**
  - document new option `spaceInJSXExpressionContainers` - [5601b77]( https://github.com/royriojas/esformatter-jsx/commit/5601b77 ), [royriojas](https://github.com/royriojas), 05/08/2015 01:02:19

    ```javascript
      "spaceInJSXExpressionContainers": " " // set it to "" to remove spaces in JSXExpressionContainers
    ```
    
## v2.0.5
- **Build Scripts Changes**
  - Add precommit module - [68a7139]( https://github.com/royriojas/esformatter-jsx/commit/68a7139 ), [royriojas](https://github.com/royriojas), 05/08/2015 00:58:39

    
- **Enhancements**
  - Add option to add spaces around JSXExpressionContainers `spaceInJSXExpressionContainers`. Closes [#11](https://github.com/royriojas/esformatter-jsx/issues/11) - [2a11c8b]( https://github.com/royriojas/esformatter-jsx/commit/2a11c8b ), [royriojas](https://github.com/royriojas), 05/08/2015 00:57:19

    
## v2.0.4
- **Bug Fixes**
  - keep selfclosing char (`/>`) in the same of the last attribute - [e066931]( https://github.com/royriojas/esformatter-jsx/commit/e066931 ), [royriojas](https://github.com/royriojas), 28/07/2015 17:34:19

    
## v2.0.3
- **Bug Fixes**
  - Major issue with nodes being deleted because some weird issue with rocambole. - [48a0a71]( https://github.com/royriojas/esformatter-jsx/commit/48a0a71 ), [royriojas](https://github.com/royriojas), 28/07/2015 02:56:49

    Switched back to use falafel-espree. Definitively it works better and do not destroy the code
    
## v2.0.2
- **Build Scripts Changes**
  - Fix pre-version script so it executes tests only once - [384d14e]( https://github.com/royriojas/esformatter-jsx/commit/384d14e ), [royriojas](https://github.com/royriojas), 28/07/2015 01:10:37

    
  - remove unused rocambole-token dep - [116bb31]( https://github.com/royriojas/esformatter-jsx/commit/116bb31 ), [royriojas](https://github.com/royriojas), 28/07/2015 01:09:46

    
## v2.0.1
- **Bug Fixes**
  - missing lib folder - [ec9935a]( https://github.com/royriojas/esformatter-jsx/commit/ec9935a ), [royriojas](https://github.com/royriojas), 28/07/2015 00:08:21

    
## v2.0.0
- **Build Scripts Changes**
  - Add bump to major script - [0bffcba]( https://github.com/royriojas/esformatter-jsx/commit/0bffcba ), [royriojas](https://github.com/royriojas), 27/07/2015 22:18:41

    
- **Refactoring**
  - Big refactoring of the beautifier to address several bugs. Fixes [#4](https://github.com/royriojas/esformatter-jsx/issues/4), Fixes [#9](https://github.com/royriojas/esformatter-jsx/issues/9) - [d1630a9]( https://github.com/royriojas/esformatter-jsx/commit/d1630a9 ), [royriojas](https://github.com/royriojas), 27/07/2015 15:57:02

    
## v1.3.0
- **Enhancements**
  - Make more predictive the parsing of jsx tags - [ca7f190]( https://github.com/royriojas/esformatter-jsx/commit/ca7f190 ), [royriojas](https://github.com/royriojas), 17/06/2015 03:07:13

    
- **Bug Fixes**
  - remove initial and final text surrounding a tag to prevent react from creating span tags - [916c0b2]( https://github.com/royriojas/esformatter-jsx/commit/916c0b2 ), [royriojas](https://github.com/royriojas), 17/06/2015 02:05:36

    
## v1.1.1
- **Build Scripts Changes**
  - simplify bump task - [c4b9582]( https://github.com/royriojas/esformatter-jsx/commit/c4b9582 ), [royriojas](https://github.com/royriojas), 16/06/2015 22:45:25

    
  - Add changelogx generation task - [8b4948e]( https://github.com/royriojas/esformatter-jsx/commit/8b4948e ), [royriojas](https://github.com/royriojas), 16/06/2015 22:44:39

    
  - Add prepush config section - [76c53e2]( https://github.com/royriojas/esformatter-jsx/commit/76c53e2 ), [royriojas](https://github.com/royriojas), 16/06/2015 22:42:00

    
- **Refactoring**
  - update to use falafel-espree - [779afc9]( https://github.com/royriojas/esformatter-jsx/commit/779afc9 ), [royriojas](https://github.com/royriojas), 16/06/2015 22:39:45

    
## v1.0.9
- **Features**
  - Ternary operators in jsx will try to remain in the same line - [eb1ee17]( https://github.com/royriojas/esformatter-jsx/commit/eb1ee17 ), [royriojas](https://github.com/royriojas), 16/06/2015 04:22:31

    
  - adding mocha runner - [6a503cb]( https://github.com/royriojas/esformatter-jsx/commit/6a503cb ), [royriojas](https://github.com/royriojas), 16/06/2015 02:17:22

    
- **Bug Fixes**
  - Fix for nested jsx structures issue - [f10a429]( https://github.com/royriojas/esformatter-jsx/commit/f10a429 ), [Roy Riojas](https://github.com/Roy Riojas), 09/03/2015 13:45:51

    Fixes an issue reported under esformatter-jsx-ignore when using nested jsx blocks.
    
    Check the readme for details about this issue.
    
- **Documentation**
  - minor cosmetic change to make the comments in the json structure be properly highlighted - [5f76bb9]( https://github.com/royriojas/esformatter-jsx/commit/5f76bb9 ), [Roy Riojas](https://github.com/Roy Riojas), 03/03/2015 04:20:04

    
  - Add comment about the best configuration to work with JSX files - [6a1135f]( https://github.com/royriojas/esformatter-jsx/commit/6a1135f ), [Roy Riojas](https://github.com/Roy Riojas), 02/03/2015 10:59:19

    
  - Add example url - [c39b4cc]( https://github.com/royriojas/esformatter-jsx/commit/c39b4cc ), [Roy Riojas](https://github.com/Roy Riojas), 28/02/2015 01:08:08

    
- **Build Scripts Changes**
  - bump minor version - [0dc5f6a]( https://github.com/royriojas/esformatter-jsx/commit/0dc5f6a ), [Roy Riojas](https://github.com/Roy Riojas), 28/02/2015 01:09:12

    
- **Tests Related fixes**
  - Add test for the case of an already formatted component - [4d28556]( https://github.com/royriojas/esformatter-jsx/commit/4d28556 ), [Roy Riojas](https://github.com/Roy Riojas), 27/02/2015 01:31:11

    
#### tag attributes
- **Bug Fixes**
  - prevent some tags from been formatted using the same escape list from `js-beautify.html` related to [#1](https://github.com/royriojas/esformatter-jsx/issues/1) - [3c2e2f7]( https://github.com/royriojas/esformatter-jsx/commit/3c2e2f7 ), [Roy Riojas](https://github.com/Roy Riojas), 01/03/2015 20:27:37

    
  - only try to format the attributes if the flag `attrsOnSameLineAsTag` is not true - [e1b9525]( https://github.com/royriojas/esformatter-jsx/commit/e1b9525 ), [Roy Riojas](https://github.com/Roy Riojas), 01/03/2015 18:29:50

    
- **Tests Related fixes**
  - Update tests - [4f1364b]( https://github.com/royriojas/esformatter-jsx/commit/4f1364b ), [Roy Riojas](https://github.com/Roy Riojas), 01/03/2015 18:36:21

    
- **Documentation**
  - Fixed quotes in the json configuration section in the README - [4ab8683]( https://github.com/royriojas/esformatter-jsx/commit/4ab8683 ), [Roy Riojas](https://github.com/Roy Riojas), 01/03/2015 16:56:32

    
- **Features**
  - Add option to format the attributes of a tag. Fix [#1](https://github.com/royriojas/esformatter-jsx/issues/1) - [653fad8]( https://github.com/royriojas/esformatter-jsx/commit/653fad8 ), [Roy Riojas](https://github.com/Roy Riojas), 01/03/2015 16:53:15

    
## v1.0.1
- **Documentation**
  - Fix formatting of the config example - [ef95fd7]( https://github.com/royriojas/esformatter-jsx/commit/ef95fd7 ), [Roy Riojas](https://github.com/Roy Riojas), 27/02/2015 01:17:06

    
## v1.0.0
- **Documentation**
  - Improved documentation - [b1e0c75]( https://github.com/royriojas/esformatter-jsx/commit/b1e0c75 ), [Roy Riojas](https://github.com/Roy Riojas), 27/02/2015 01:14:46

    
  - Fix incorrect plugin name in Readme - [2c6798a]( https://github.com/royriojas/esformatter-jsx/commit/2c6798a ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 14:19:04

    
  - Fix the build badge - [3988916]( https://github.com/royriojas/esformatter-jsx/commit/3988916 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:20:00

    
  - Add a note about the failure to load the plugin using the configuration JSON - [13a137a]( https://github.com/royriojas/esformatter-jsx/commit/13a137a ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 02:52:32

    
  - Better Readme - [df8d9c1]( https://github.com/royriojas/esformatter-jsx/commit/df8d9c1 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 02:24:49

    
- **Build Scripts Changes**
  - First commit - [c8d4d2b]( https://github.com/royriojas/esformatter-jsx/commit/c8d4d2b ), [Roy Riojas](https://github.com/Roy Riojas), 27/02/2015 01:13:55

    
  - Bump minor version - [66cd811]( https://github.com/royriojas/esformatter-jsx/commit/66cd811 ), [Roy Riojas](https://github.com/Roy Riojas), 26/02/2015 20:21:31

    
  - Update to latest fresh-falafel - [541d12c]( https://github.com/royriojas/esformatter-jsx/commit/541d12c ), [Roy Riojas](https://github.com/Roy Riojas), 26/02/2015 20:21:08

    
  - Bump the minor version - [dd3c10c]( https://github.com/royriojas/esformatter-jsx/commit/dd3c10c ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:27:43

    
  - Update fresh falafel dep - [6d0ccf5]( https://github.com/royriojas/esformatter-jsx/commit/6d0ccf5 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:27:11

    
  - Bump the build version - [caa3306]( https://github.com/royriojas/esformatter-jsx/commit/caa3306 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:20:35

    
  - Add missing travis.yml - [e6c0d3a]( https://github.com/royriojas/esformatter-jsx/commit/e6c0d3a ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:10:48

    
  - First commit - [75264a5]( https://github.com/royriojas/esformatter-jsx/commit/75264a5 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 02:09:29

    
- **Other changes**
  - Add esprima-fb as peer dependecy to make travis happy - [1e73618]( https://github.com/royriojas/esformatter-jsx/commit/1e73618 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 03:14:20

    
  - Initial commit - [aad4a63]( https://github.com/royriojas/esformatter-jsx/commit/aad4a63 ), [Roy Riojas](https://github.com/Roy Riojas), 24/02/2015 01:48:19

    
