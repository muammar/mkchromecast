# rocambole-indent

Helpers to manipulate [rocambole](https://github.com/millermedeiros/rocambole)
`Indent` tokens.

Used mainly by [esformatter](https://github.com/millermedeiros/esformatter/) and its plugins.


## API

```js
var indent = require('rocambole-indent');
```

### setOptions(opts)

`setOptions` used to set the indent value.

```js
setOptions({
  // sets "value" used by `Indent` tokens (defaults to two spaces)
  value: '  ',
  // amount of indents added on `alignComments` if comment is inside an empty
  // block (surrounded by `{}`, `[]` or `()`) - defaults to `1`
  CommentInsideEmptyBlock: 1
});
```

### inBetween(startToken, endToken, level)

Increase/Decrease the indent level in between the `startToken` and `endToken`.

It will not include the start and end tokens on the indentation range, only the
tokens in between them.

```js
// increase the indent level by 1
inBetween(node.startToken, node.endToken, 1);
// decrease the indent level by 1
inBetween(node.startToken, node.endToken, -1);
// zero does nothing
inBetween(node.endToken, 0);
```

**Important:** negative values only work if original `Indent` token contains
a `level` property since there is no reliable way to infer this value (probably
will only work if indent was added by this lib).

### addLevel(token, level)

Increases/decreases the indent level at the beginning of the line that includes
the given `token`.

```js
// adds 2 indents
addLevel(node.startToken, 2);
// decrease indent level in 1 step
addLevel(node.endToken, -1);
// zero does nothing
addLevel(node.endToken, 0);
```

**Important:** negative values only work if original `Indent` token contains
a `level` property since there is no reliable way to infer this value (probably
will only work if indent was added by this lib).

### sanitize(astOrNode)

Removes any `Indent` tokens that don't have a `level` property (this is
usually the original indentation of the program parsed by rocambole) or that
are not at the beginning of the line. Also removing `WhiteSpace` tokens that
are at the beginning of the line to avoid mistakes.

```js
// sanitize a single node
sanitize(node);
// sanitize whole AST
sanitize(ast);
```

### updateBlockComment(token)

Updates `BlockComment` `raw` value to make sure all the lines have the same
`Indent` level.

This is called internally by the `addLevel` and `indentInBetween` methods (if
first token of line is a `BlockComment`), so as long as you only use those
methods to edit the indent level you shouldn't need to call this.

### alignComments(astOrNode)

Align all the comments based on the next/previous lines inside a given `ast` or
`node`.

It will align the comments with the next line unless the comment block is
followed by an empty line, in that case it will use the previous non-empty line
as a reference.

Example output:

```js
// aligned with next line
switch (foo) {
  // aligned with next non-empty line

  case bar:
    // aligned with next line
    baz();
    // this should be aligned with previous line since comment block is
    // followed by an empty line

  // aligned with next line
  case biz:
    // aligned with next line
    what();
// aligned with next line
}

function noop() {
  // indented since it's inside an empty block
}

// aligned with previous line since it's at the end of program
```

### whiteSpaceToIndent(token, [indentValue])

Convert `WhiteSpace` token into `Indent` if it's the first token of the line.

You can pass a custom `indentValue` or it will use the value set by
`setOptions()` to calculate the indent `level` (basically count how many times
this string repeats inside the `token.value`).

```js
var token = {
  type: 'WhiteSpace',
  value: '\t\t\t',
  prev: { type: 'LineBreak', value: '\n' }
};
whiteSpaceToIndent(token, '\t');
// edits properties in place
console.log(token.type);  // > "Indent"
console.log(token.level); // > 3
```

This is useful in case you want to make sure `sanitize` won't remove the
original indents.

## Debug

This module uses [debug](https://www.npmjs.com/package/debug) internally. To
make it easier to identify what is wrong we sometimes run the esformatter tests
with a `DEBUG` flag, like:

```sh
DEBUG=rocambole:indent npm test
```

## License

Released under the MIT License

