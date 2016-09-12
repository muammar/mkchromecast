# rocambole-indent changelog

## v2.0.4 (2015-05-02)

 - align comments surrounded by empty lines with next non-empty line. (#6)

## v2.0.3 (2015-03-26)

 - fix comment alignment if surrounded by empty lines (#5)

## v2.0.2 (2015-03-25)

 - fix edge cases related to comments just after `{` followed by an empty line.

## v2.0.1 (2015-03-25)

 - safeguard against empty nodes/ast on `alignComments()`

## v2.0.0 (2015-03-25)

 - change `alignComments()` rule to add one indent level if comment is inside
   empty block/array/parenthesis

## v1.1.1 (2015-03-25)

 - fix `WhiteSpace` conversion into `Indent` inside `alignComments()`

## v1.1.0 (2015-03-25)

 - update `alignComments()` to consider `WhiteSpace` tokens at the begining of
   the line as `Indent` tokens as well
 - add `whiteSpaceToIndent()`

## v1.0.0 (2015-03-24)

 - add `alignComments()`
 - expose `updateBlockComment()`

## v0.2.0 (2015-03-20)

 - rename `line()` as `addLevel()`
 - change the way `inBetween()` loops through the `start` and `end` tokens
   (not inclusive)
 - `sanitize()` won't call `updateBlockComment()` since this is already handled
   by `addLevel()`

## v0.1.0 (2015-03-20)

 - initial release

