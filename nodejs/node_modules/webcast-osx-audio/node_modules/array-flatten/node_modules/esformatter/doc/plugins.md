## Plugins

Esformatter also have support for plugins (v0.2.0+).

JavaScript is a very flexible language, which means people write it in many
different ways, since adding support for every single kind of style would be
*impossible*, we decided to introduce plugins; that should give enough
flexibility to tailor the formatting to match the craziest needs.

Plugins are automatically loaded from `node_modules` if you pass the module id
in the config file:

```json
{
  "indent": {
    "value": "\t"
  },
  "plugins": ["esformatter-sample-plugin", "foobar"]
}
```

List of plugins and plugins wish list: https://github.com/millermedeiros/esformatter/wiki/Plugins

You also have the option to `register` a plugin programmatically:

```js
var plugin = {
  nodeAfter: function(node) {
    // transform node here
  }
};
esformatter.register(plugin);
```

Plugins are executed in the same order as they are registered (first in, first
out).

The plugin methods are executed in the following order: `setOptions` > `stringBefore` > `transformBefore`  > `tokenBefore` > `nodeBefore` > `nodeAfter` > `tokenAfter` > `transformAfter` > `stringAfter`.

**All plugin methods are optional.**

**IMPORTANT:** If you need to edit the structure of the AST (add/remove nodes,
change the order of elements) we recommend you to write it as a standalone CLI
tool whenever possible and use the [pipe](./config.md#pipe) option instead of writting a plugin
(eg. [strip-debug](https://www.npmjs.com/package/strip-debug)). Plugins should
ideally only add/remove/edit the `WhiteSpace`, `Indent`, `LineBreak` and
`Comment` tokens, otherwise you might have conflicts with other plugins and
esformatter itself.

**protip:** You can use
[rocambole-token](https://github.com/millermedeiros/rocambole-token) and
[rocambole-node](https://github.com/millermedeiros/rocambole-node) to simplify
the AST manipulation process.


### setOptions(options)

Called once before any manipulation, the object is shared with the esformatter
which means you can use this method to override default options if needed.

```js
var options;

plugin.setOptions = function(opts) {
  // override the default settings (objects are passed by reference, changing
  // the value here will also change the value used by esformatter)
  opts.indent.value = '  ';
  // store the options to be used later
  options = opts;
};
```

### stringBefore(inputString):String

A way to replace the input string, it should **ALWAYS** return a string.

```js
plugin.stringBefore = function(str) {
  // prepend a variable declaration to the file
  return 'var foo = "bar";\n' + str;
};
```

PS: you should only really use this method if you need to store some state
during `stringBefore` to be used by your other methods; otherwise favor the
[pipe](./config.md#pipe) option.

### stringAfter(outputString):String

Replaces the output string.

```js
plugin.stringAfter = function(str) {
  // replaces all the occurances of "foo" with "bar" (very naive)
  // using regular expressions or string manipulation methods to process code
  // is very error-prone! BEWARE!
  return str.replace(/foo/g, 'bar');
};
```

PS: you should only really use this method if you need to recover from some of
the changes you introduced by the other plugin methods; otherwise favor the
[pipe](./config.md#pipe) option.

### tokenBefore(token)

Called once for each token (eg. Keyword, Punctuator, WhiteSpace, Indent...)
before processing the nodes. Can be used to manipulate the token value or
add/remove/replace the token or tokens around it.

```js
var tk = require('rocambole-token');

plugin.tokenBefore = function(token) {
  if (tk.isSemiColon(token) && tk.isSemiColon(token.next)) {
    // remove semicolon if next token is also a semicolon
    tk.remove(token);
  }
};
```

### tokenAfter(token)

Called once for each token (eg. Keyword, Punctuator, WhiteSpace, Indent...)
after processing all the nodes. Can be used to manipulate the token value or
add/remove/replace the token or tokens around it.

### nodeBefore(node)

Called once for each `node` of the program (eg. VariableDeclaration,
IfStatement, FunctionExpression...) before the esformatter default
manipulations.

### nodeAfter(node)

Called once for each `node` of the program (eg. VariableDeclaration,
IfStatement, FunctionExpression...) after the esformatter default
manipulations.

```js
var tk = require('rocambole-token');

plugin.nodeAfter = function(node) {
  if (node.type === 'FunctionExpression' || node.type === 'FunctionDeclaration') {
    if (node.body) {
      // insert a line break before the function body
      tk.before(node.body.startToken, {
        type: 'LineBreak',
        value: options.lineBreak.value
      });
    }
  }
};
```

### transformBefore(ast)

Called before esformatter loops through all the nodes, it receives the whole
AST in case you need a different loop strategy than `rocambole.moonwalk`. In
most cases the `nodeBefore` method is enough.

This method **should only** be used to add/remove `WhiteSpace`, `LineBreak` and
`Indent` tokens.

It's very important to note that adding/removing/reordering `nodes` might cause
some serious problems on the code formatting. esformatter will skip nodes
unless you instrument them properly (adding all the properties that
`rocambole.moonwalk`, `rocambole.recursive` and future plugins expects) so it
is not recommended to do it here.

If you need to edit the tree structure please use the `stringBefore` method or
write a standalone CLI tool that can be used on the [pipe](./config.md#pipe)
setting.

### transformAfter(ast)

Called after all nodes and tokens are processed, allows overriding all the
changes (including indentation).

This method **should only** be used to add/remove `WhiteSpace`, `LineBreak` and
`Indent` tokens.

```js
var rocambole = require('rocambole');

plugin.transformAfter = function(ast) {
  // if you need to manipulate multiple nodes you can use the
  // rocambole.moonwalk or rocambole.walk methods. we don't do it
  // automatically since you might have very specific needs
  rocambole.moonwalk(ast, function(node) {
    doStuff(node);
  });
};
```

It's very important to note that adding/removing/reordering `nodes` might cause
undesired side effects on other plugins (`rocambole.moonwalk` and
`rocambole.walk` might not work as expected and/or you might forget some
`node.[start|end]Token` and/or `token.[next|prev]` and break other plugins). So
if you need to edit the tree structure please use the `stringAfter` method or
  write a standalone CLI tool that can be used on the [pipe](./config.md#pipe)
  setting.
