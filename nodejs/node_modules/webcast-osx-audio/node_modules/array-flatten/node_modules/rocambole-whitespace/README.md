# rocambole-whitespace

Helpers to manipulate [rocambole](https://github.com/millermedeiros/rocambole)
`WhiteSpace` tokens.

Used mainly by [esformatter](https://github.com/millermedeiros/esformatter/) and its plugins.


## API

```js
var ws = require('rocambole-whitespace');
```

### setOptions(opts)

`setOptions` is just a way to store some constants so later on the
`limit`/`limitBefore`/`limitAfter` you can reference the values by Id.

```js
setOptions({
  // sets "value" used by `WhiteSpace` tokens (defaults to single space)
  value: ' ',

  // values inside "before" are used by `limitBefore`
  before: {
    // setting to `0` will remove all spaces before the token
    parenthesis: 0
  },

  // values inside "after" are used by `limitAfter`
  after: {
    // setting to `1` will add/keep a single `WhiteSpace` after the token
    parenthesis: 1
  }
});
```

**Important:** calling this method will override **all** the options.

### limitBefore(token, typeOrValue)

limits the amount of `WhiteSpace` before a given token.

```js
// remove all white spaces before `node.startToken`
limitBefore(node.startToken, 0);
// add/keep 2 white spaces before `node.startToken`
limitBefore(node.startToken, 2);
// will use value stored on `setOptions` for `before.parenthesis`
limitBefore(node.startToken, 'parenthesis');
// values smaller than zero are ignored (this won't change anything)
limitBefore(node.startToken, -1);
```

### limitAfter(token, typeOrValue)

limits the amount of `WhiteSpace` after a given token.

```js
// remove all white spaces after `node.startToken`
limitAfter(node.startToken, 0);
// add/keep 1 white space after `node.startToken`
limitAfter(node.startToken, 1);
// will use value stored on `setOptions` for `after.parenthesis`
limitAfter(node.startToken, 'parenthesis');
// values smaller than zero are ignored (this won't change anything)
limitAfter(node.startToken, -1);
```

### limit(token, typeOrvalue)

limits the amount of `WhiteSpace` around a given token.

```js
// add/keep 1 white space before and after `node.startToken`
limit(node.startToken, 1);

// it's just an alias to
limitBefore(node.startToken, 1);
limitAfter(node.startToken, 1);
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
DEBUG=rocambole:ws:* npm test
```

## License

Released under the MIT License

