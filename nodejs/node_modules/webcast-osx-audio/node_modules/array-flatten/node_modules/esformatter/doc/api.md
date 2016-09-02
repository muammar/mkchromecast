# API

## esformatter.format(str[, opts]):String

`format()` method receives a string containing the code that you would like to
format and the configuration options that you would like to use and returns
a string with the result.

```js
var esformatter = require('esformatter');
var fs = require('fs');
var codeStr = fs.readFileSync('path/to/js/file.js').toString();

// for a list of available options check "lib/preset/default.json"
var options = {
  indent: {
    value: '  '
  },
  lineBreak: {
    before: {
      // at least one line break before BlockStatement
      BlockStatement: '>=1',
      // only one line break before DoWhileStatementOpeningBrace
      DoWhileStatementOpeningBrace: 1,
    // ...
    }
  },
  whiteSpace: {
    // ...
  }
};

// return a string with the formatted code
var formattedCode = esformatter.format(codeStr, options);
```

### Custom Parser

Since v0.7 we started to use [espree](https://github.com/eslint/espree) because
it supports ES6 and JSX syntax and produces an AST that is similar to
[esprima](http://esprima.org). To override the parser you can do:

```js
var esprima = require('esprima');
// function used by `rocambole` to parse the program
esformatter.format.parseFn = esprima.parse;
// the `this` value inside the `parseFn`
esformatter.format.parseContext = esprima;
// options passed to the parser
esformatter.format.parseOptions = {
  // we need range, comment and tokens info to build the rocambole AST
  range: true,
  tokens: true,
  comment: true
};
```

## esformatter.transform(ast[, opts]):AST

or you can use the `transform()` method to manipulate an AST in place (allows
pipping other tools that manipulates the AST). - so far only supports
[rocambole](https://github.com/millermedeiros/rocambole) generated ASTs, but we
will work to fix this limitation in the future (see [issue #86](https://github.com/millermedeiros/esformatter/issues/86)).

```js
var inputAST = rocambole.parse('var foo=123;');
// you can also pass the formatting options as second argument like the
// `format` method
var outputAST = esformatter.transform(inputAST);
assert(outputAST === inputAST, 'edits AST in place');
assert(outputAST.toString() === 'var foo = 123;', 'formats input');
```

## esformatter.diff

esformatter is also able to check if files are formatted properly and return
pretty diffs.

### esformatter.diff.chars(str[, opts, fileName]):String

Gets a colored char diff if file is not formatted properly. Otherwise it
returns an empty string.

```js
var diff = esformatter.diff.chars(code);
console.log(diff);
```

### esformatter.diff.unified(str[, opts, fileName]):String

Gets a colored unified diff if file is not formatted properly. Otherwise it
returns an empty string.

```js
var diff = esformatter.diff.unified(code);
console.log(diff);
```

### esformatter.diff.unifiedNoColors(str[, opts, fileName]):String

Gets an unified diff if file is not formatted properly. Otherwise it returns an
empty string.

```js
var diff = esformatter.diff.unifiedNoColors(code);
console.log(diff);
```

## esformatter.rc([filePath], [customOptions]):Object

Used by task runners and/or plugin authors to retrieve the configuration stored
on `.esformatter` and `package.json` files relative to the `filePath`, `cwd` or
global config file (`~/.esformatter`) if it can't find any config file until
the root path.

You can also pass an object with `customOptions` to override the default
options.

`rc` will merge the options from multiple [config files](./config.md).

```js
// will start search from the "foo/bar" directory
var baseConfig = esformatter.rc('foo/bar/baz.js');
// will start the search from cwd
var otherConfig = esformatter.rc();
// merge some custom options to the user settings
var override = esformatter.rc({
  indent: { value: '\t' }
});
```

## esformatter.register(plugin)

Register a [plugin](./plugins.md) module.

```js
var plugin = {
  nodeAfter: function(node) {
    // called once for each node, after the esformatter manipulation
  }
};
esformatter.register(plugin);
```

## esformatter.unregister(plugin)

Remove [plugin](./plugins.md) from the execution queue.

```js
esformatter.unregister(pluginObject);
```

## esformatter.unregisterAll()

Remove all the registered [plugins](./plugins.md) from the execution queue;
useful in case you want to edit multiple files using different plugins each
time.

