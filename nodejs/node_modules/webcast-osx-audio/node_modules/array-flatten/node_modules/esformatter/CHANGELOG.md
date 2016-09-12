# esformatter changelog

## v0.8.2 (2016-01-28)

 - avoid indenting body of arrow functions twice. fixes #357
 - add test for arrow function indentation. closes #393
 - avoid double indent for nodes during assignment. fixes #380
 - change default value for MemberExpression line breaks. fixes #378
 - add test for returning class expression. closes #358
 - add option to set space after MethodDefinitionName. closes #384
 - fix ReturnStatement indentation. fixes #377
 - add support for ClassExpression. fixes #359
 - fix SwitchCaseColon when not immediately followed by another case. closes #392
 - update npm-run to v2.0, fixes unit tests on node v4.2; closes #376
 - fix ENOENT error tests. see #376. closes #383.

## v0.8.1 (2015-10-28)

 - ops, forgot to lint.

## v0.8.0 (2015-10-28)

 - pass esformatter instance to plugins during `setOptions`. closes #348
 - remove semver dep (not needed anymore)
 - fix line breaks around ParameterComma not enforced for FunctionExpression #373
 - fixes generator functions
 - fixes delete p['t']
 - add support for "for...of" statements
 - add support for experimental object spread operator. closes #353
 - avoid applying FunctionReservedWord whitespace to class method definition
 - migrate to espree 2.x
 - added option for SwitchCaseColon for normalizing spacing around switch cases

## v0.7.3 (2015-08-03)

 -  limit the amount of white spaces and line breaks on MemberExpression. fixes #343
 -  add support for indent.SingleVariableDeclaration. closes #339
 -  limit the amount of line breaks and white spaces after VariableValue and around VariableDeclarationSemiColon. closes #334
 -  fix ClassDeclaration `extends` expressions. closes #337

## v0.7.2 (2015-07-17)

 - Fix the CLI --diff-unified flag
 - make sure we load the global config if findAndMergeConfigs returns an empty object. fixes #336
 - add ModuleSpecifierOpeningBrace and ModuleSpecifierClosingBrace settings

## v0.7.1 (2015-06-26)

 - limit line break and white space after new keyword. fixes #321
 - use user-home dependency to locate the global config file. fixes #323

## v0.7.0 (2015-05-13)

 - handle all the ES6 import/export formats. closes #311
 - add support for ArrayPattern (array destructuring). closes #302
 - better support for ObjectPattern (object detructuring). closes #301
 - fix error when constructor call don't use parentheses. fixes #318
 - handle ES6 Object literal Property value shorthand properly
 - add lineBreak[before|after].CommentGroup support. closes #310
 - add support for computed property names in ObjectExpression and change default line break rules for PropertyName and PropertyValue. fixes #287
 - use espree to parse the programs by default (more ES6 features and JSX support) and allow user to replace parser if needed
 - better defaults for ObjectExpressionOpeningBrace and ObjectExpressionClosingBrace
 - rename indent.AlignComments to indent.alignComments for consistency
 - explain that the config property names are derived from the esprima AST node types. closes #307
 - show a descriptive error message when we can't find a plugin. fixes #309
 - add --diff flags and replace optimist with minimist. closes #292
 - fix VariableDeclaration.init indentation when value is surounded by parenthesis. see #306
 - indent UnaryExpression by default if inside AssignmentExpression, CallExpression, ObjectExpression and VariableDeclaration. fixes #306
 - better error messages and avoids terminating the process on first error. fixes #303
 - add glob expansion support. closes #291

## v0.6.1 (2015-03-27)

 - fix comment alignment if surrounded by whitespaces. closes #297
 - improve ObjectExpression hook logic to handle values surrounded by parenthesis. fixes #295
 - fix setOptions behavior to allow user to override plugin default settings. fixes #293

## v0.6.0 (2015-03-26)

 - add support for the pipe option on the config file, allowing user to pipe other CLI tools. closes #168
 - add support for ES6 classes. closes #286
 - add support for ES6 default params. closes #285
 - add support for ES6 arrow functions. closes #255
 - change comment indentation behavior to match next/prev code block based on context. fixes #209. fixes #270.
 - extract helpers from lib/indent.js into rocambole-indent. closes #277
 - fixes SwitchCase indentation range. closes #290
 - ignore shebang by default. closes #284
 - add setting to limit line breaks and white spaces around BreakKeyword. fixes #213
 - limit spaces before function name. closes #283
 - make sure plugins.setOptions is called before plugins.stringBefore. fixes #288
 - replace lib/lineBreak.js with rocambole-linebreak. closes #279
 - replace lib/whiteSpace.js with rocambole-whitespace. closes #278
 - support in place edits. fixes #275
 - use locally installed esformatter version if available. closes #190

## v0.5.1 (2015-03-17)

 - make it work with esprima@2.1 AST!
 - ConditionalExpression: indent even if consequent is on the same line as the test
 - Fix indent for logical expression as argument of return statement
 - Fix indent for multi-var declaration with logical expression
 - ForStatement improvements
 - IfStatement: Fix multi-line test with comments
 - ObjectExpression: Indent multi-line binary and logical expression values
 - Update jQuery preset to fix single-line object expression spacing
 - Update jQuery preset to make use of new IIFE settings
 - fix DoWhileStatement indent. closes #256
 - improve CallExpression hook to handle a few edge cases and add option to limit br/ws around opening/closing parentheses. closes #267
 - improve getter/setter behavior on ObjectExpression. fixes #265
 - indent NewExpression arguments. fixes #254
 - make sure we don't loop over same CatchClause twice. fixes #264

## v0.5.0 (2015-02-26)

 - add support for br/ws around IIFEOpeningParentheses and IIFEClosingParentheses and keep spaces around CallExpression to avoid conflicts. closes #223. closes #250.
 - don't remove line breaks before FunctionExpression by default and handle an edge case for array indentation if it is a chained member expression argument. fixes #202
 - drop ArgumentList exceptions (used previously by jQuery preset)
 - fix FunctionExpression: Handle two special cases for TopLevelFunctionBlock
 - fix SwitchCase indent if missing semicolon after break. fixes #225
 - fix array indentation for cases where closing bracket is on the same line. simplify ObjectExpression indentation logic while also fixing how it works inside arrays. fixes #224. fixes #239.
 - fix indent edges for chained MemberExpression. fixes #240
 - improve IfStatement.test indentation. closes #222
 - indent BinaryExpression & LogicalExpression if inside VariableDeclaration, CallExpression or AssignmentExpression. fixes #212
 - indent support for ParameterList and enable it by default. closes #231
 - make sure plugins are loaded/registered before `plugins.stringBefore` is called and expose `unregisterAll`. fixes #245. closes #246.
 - only indent if there is a line break before/between arguments. fixes #238
 - support getters/setters in ObjectExpression
 - update jQuery preset to use CatchParameterList whiteSpace setting
 - update jQuery preset to tolerate single line objects
 - update rocambole to v0.5 and change the BinaryExpression test to match esprima@2.0 behavior (no EmptyStatement between ExpressionStatements). see #192

## v0.4.3 (2014-10-13)

 - fix error related to multiple `plugin.register` calls. (#218)

## v0.4.2 (2014-09-08)

 - fix `else if` consequent with no braces. closes #196
 - fix indent of nested if braces before comments. closes #197
 - fix CatchClause indent and add settings for `FinallyKeyword` and `TryKeyword`. closes #203
 - indent `LogicalExpression` if it's the `VariableDeclaration.init`.

## v0.4.1 (2014-07-09)

 - fix comma and white spaces around object property values (#191).
 - fix ObjectExpression indent edges (#193).

## v0.4.0 (2014-07-06)

 - add `transformBefore` hook for plugins and `transformAfter` to keep API consistent. closes #187
 - add option to add/remove trailing empty lines in the file (EOF). closes #111.
 - add options to control line breaks inside ArrayExpressions. closes #129
 - add support for multiple indent levels (closes #179, closes #106).
 - add double indent for `IfStatementConditional` on the jQuery preset (closes #150)
 - add support for line breaks before/after `PropertyName` and `PropertyValue` (closes #184)
 - support plugins option on the CLI. closes #182
 - fix `MemberExpression` indent behavior. (meta bug #181)
 - fix indent end edge for `FunctionExpression` inside `MemberExpression`. closes #152
 - change indent rules for `AssignmentExpression` and `ConditionalExpression` to match jQuery preset needs. closes #149
 - convert comma-first objects to comma-last (closes #175)
 - improve `CatchClause` and `TryStatement` line break and white space handling. closes #128
 - improve `ReturnStatement` and `CallExpression` indent behavior.
 - rename `ChainedMemberExpression` to `MemberExpression` on the config file.

## v0.3.2 (2014-06-23)

 - fix issue with sparse arrays. see millermedeiros/rocambole#15
 - fix Params comma handling and update rocambole to 0.3.4 to fix BlockComment. closes #139
 - fix indent for objects inside arrays. closes #142
 - fix white space inside expression statement with parens. closes #155
 - change IfStatement indent edges to avoid indenting comments that are just before `} else`. closes #123
 - fix comments inside ObjectExpression. closes #166


## v0.3.1 (2014-06-23)

 - avoid merging undefined config on `esformatter.rc`.
 - make sure `esformatter.rc` doesn't load config file if user provides
   a 'preset' or if 'root == true' to match CLI behavior.


## v0.3.0 (2014-06-20)

 - expose ALL the things!! exposed a few methods related to line break, white
   space and indentation; also flattened the directory structure to make it
   easier for plugin authors to reuse esformatter internal methods when needed.


## v0.2.0 (2014-06-16)

 - add plugin support.
 - refactored the way indentation is handled (and changed default settings
   related to indentation).
 - expose the `rc` method.
 - fix rc merge/search logic to avoid problems on windows.
 - fix `void 0`
 - proper indent edges for `AssignmentExpression`
 - indent `CallExpression` by default
 - make sure `_br.limit` doesn't remove LineBreak if previous token is
   a comment (fixes a few bugs).
 - fix comments inside empty catch block (avoid removing line breaks).


## v0.1.1 (2014-05-12)

 - fix error when input is an empty file.
 - fix `typeof`
 - add spaces inside ForStatement and WhileStatement parenthesis on jQuery
   preset.


## v0.1.0 (2014-04-15)

 - major refactor on the code structure and major changes to the default tool
   behavior.
 - changed some rules so the tool is less opinionated.
 - change formatter logic to support ranges on the configuration file.
 - avoid removing line breaks during the formatting process, increasing the
   flexibility of the formatting rules.


## notes about v0.0.1 (2012-12-06) till v0.0.16 (2014-02-24)

The formatter had stricter rules and was way less flexible before v0.1.0;

Lots of small improvements between each version. Behavior was still in flux and
each version was breaking backwards compatibility.

We considered v0.0.15 (2013-12-18) to be "stable" for most common cases, most
of bugs found in the following months after release was on edge-cases. We
decided to make a big refactor to increase the formatter flexibility and to be
less aggressive on the changes.


