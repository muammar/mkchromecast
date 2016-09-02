# Changelog

## v0.7.0 (2015/08/26)

 - Ignore TryStatement's "handlers" property in favor of "handler"

## v0.6.0 (2015/03/30)

 - allow custom parser. (#27)

## v0.5.1 (2015/03/19)

 - make it compatible with esprima@2.1 (don't loop through the same CatchClause
  twice).

## v0.5.0 (2015/02/25)

 - updated `esprima` to v2.0 because of ES6 features and to avoid `esprima-fb`
   bug related to RegExp.

## v0.4.0 (2014/07/14)

 - aliased `rocambole.recursive` as `rocambole.walk` to avoid confusions.
 - switched `esprima` dependency to `esprima-fb` because of ES6 features.

## v0.3.6 (2014/06/23)

 - really handle sparse arrays (eg. `[,]`), fixes moonwalk. (#15)

## v0.3.5 (2014/06/23)

 - handle sparse arrays (eg. `[,]`). (#15)

## v0.3.4 (2014/06/23)

 - only add `BlockComment.originalIndent` if `WhiteSpace` is on the start of
   a line.

## v0.3.3 (2014/04/26)

 - add `toString` to empty programs AST (#16)

## v0.3.2 (2014/01/17)

 - exports `BYPASS_RECURSION` (#8)
 - fix error if input is empty (#12)
 - support anything that implements `toString()` as input (#13)

## v0.3.1 (2013/12/15)

 - fix `originalIndent` on `BlockComment` when prev token is not `WhiteSpace`.

## v0.3.0 (2013/12/15)

 - add `originalIndent` to `BlockComment` (#11)

## v0.2.3 (2013/01/08)

 - improve `rocambole.parse()` performance by 4500%. (#4)
 - improve `rocambole.moonwalk()` performance by 11000%.

## v0.2.2 (2012/12/19)

 - fix consecutive comments before start of program. (#3)

## v0.2.1 (2012/12/13)

 - fix `loc` info on `WhiteSpace` and `LineBreak` tokens. (#2)

## v0.2.0 (2012/12/09)

 - Deprecated:
   - `token.before()`
   - `token.after()`
   - `token.remove()`
   - `node.getTokens()`
   - `ast.nodes`
 - avoid recursion over comments.
 - fix weird bug on esformatter introduced on v0.1.1 related to `token._ast`
   property.

## v0.1.1 (2012/12/08)

 - Improve token manipulation methods behavior (`before`, `after`, `remove`)

## v0.1.0 (2012/12/06)

 - Initial release
