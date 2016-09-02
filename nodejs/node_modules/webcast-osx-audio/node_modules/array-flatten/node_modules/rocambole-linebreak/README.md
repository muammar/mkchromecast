# rocambole-linebreak

Helpers to manipulate [rocambole](https://github.com/millermedeiros/rocambole)
`LineBreak` tokens.

Used mainly by [esformatter](https://github.com/millermedeiros/esformatter/) and its plugins.

## Allowed values

 - positive integer (`1` till `99`): "add or keep `[n]` line breaks".
 - `-1`: keep original line breaks.
 - `">2"`: add linebreaks until it's over `2`.
 - `">=1"`: add line breaks until it's equal or greater than `1`.
 - `"<2"`: remove linebreaks until it's smaller than `2`.
 - `"<=1"`: remove/add line breaks until it's smaller or equal to `1`.

## API

```js
var br = require('rocambole-linebreak');
```

### setOptions(opts)

`setOptions` is just a way to store some constants so later on the
`limit`/`limitBefore`/`limitAfter` you can reference the values by Id.

```js
setOptions({
  // sets "value" used by `LineBreak` tokens (defaults to `"\n"`)
  value: '\n',

  // values inside "before" are used by `limitBefore`
  before: {
    // setting to `0` will remove all line breaks before the token
    parenthesis: 0
  },

  // values inside "after" are used by `limitAfter`
  after: {
    // setting to `1` will add/keep a single `LineBreak` after the token
    parenthesis: 1
  }
});
```

**Important:** calling this method will override **all** the options.

### limitBefore(token, typeOrValue)

limits the amount of `LineBreak` before a given token.

```js
// remove all line breaks before `node.startToken`
limitBefore(node.startToken, 0);
// add/keep 2 line breaks before `node.startToken`
limitBefore(node.startToken, 2);
// add/keep more than 1 line break
limitBefore(node.startToken, '>1');
// keep 2 line breaks or more
limitBefore(node.startToken, '>=2');
// keep less than 3 line breaks
limitBefore(node.startToken, '<3');
// will use value stored on `setOptions` for `before.parenthesis`
limitBefore(node.startToken, 'parenthesis');
// values smaller than zero are ignored (this won't change anything)
limitBefore(node.startToken, -1);
```

### limitAfter(token, typeOrValue)

limits the amount of `LineBreak` after a given token.

```js
// remove all line breaks after `node.startToken`
limitAfter(node.startToken, 0);
// add/keep 1 line break after `node.startToken`
limitAfter(node.startToken, 1);
// add/keep more than 1 line break
limitAfter(node.startToken, '>1');
// keep 2 line breaks or more
limitAfter(node.startToken, '>=2');
// keep less than 3 line breaks
limitAfter(node.startToken, '<3');
// will use value stored on `setOptions` for `after.parenthesis`
limitAfter(node.startToken, 'parenthesis');
// values smaller than zero are ignored (this won't change anything)
limitAfter(node.startToken, -1);
```

### limit(token, typeOrValue)

limits the amount of `LineBreak` around a given token.

```js
// add/keep 1 line break before and after `node.startToken`
limit(node.startToken, 1);

// it's just an alias to
limitBefore(node.startToken, 1);
limitAfter(node.startToken, 1);
```

### limitBeforeEndOfFile(ast[, typeOrValue])

limits the amount of line breaks at the end of the AST.

```js
// at least one line break at the end of the file
limitBeforeEndOfFile(ast, 1);
// if you don't pass the `typeOrValue` it will use "EndOfFile" as the type
limitBeforeEndOfFile(ast);
```

### expectedBefore(type)

reads value stored during `setOptions` for a given `type`, or returns `-1` if
not found.

```js
assert( expectedBefore('parenthesis') === 0 );
```

### expectedAfter(type)

reads value stored during `setOptions` for a given `type`, or returns `-1` if
not found.

```js
assert( expectedAfter('parenthesis') === 1 );
```

## Debug

This module uses [debug](https://www.npmjs.com/package/debug) internally. To
make it easier to identify what is wrong we sometimes run the esformatter tests
with a `DEBUG` flag, like:

```sh
DEBUG=rocambole:br:* npm test
```

## License

Released under the MIT License

