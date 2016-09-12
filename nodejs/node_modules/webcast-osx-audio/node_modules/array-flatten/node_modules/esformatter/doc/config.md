# Configuration

When running `esformatter` executable on the terminal, it will look for the
closest `.esformatter` file and use that as a setting unless you specify
`--preset default` or `--config ./path/to/config_file.json`.

You also have the option to put your `esformatter` settings inside the
`package.json` file under the `esformatter` property.

## property names

Most of the property names are based on the [esprima AST node
types](http://esprima.org/demo/parse.html). For a list of node types you can
also check the [estree spec](https://github.com/estree/estree).

Our [default settings](../lib/preset/default.json) should have all the names
that we recognize, even if we don't list them in all the places the config
probably use the same ids on all the settings (`indent`, `lineBreak` and
`whiteSpace`), don't get intimidated by the names!

## root

Settings from multiple files will be merged until it finds a config file that
contains the property `"root": true`; that makes it easy to define exceptions
to the project rules without needing to copy all the shared properties. - for
an example see test files inside the `"test/compare/rc"` folder.

```js
{
  "root": true
}
```

## indent

Indent is responsible for whitespace at the front of each line. `indent.value`
is used for each indentation. The default indents with two spaces. Setting
`indent.value` to `"\t"` will switch to indentation using tabs.

The other properties for indent toggle indentation for specific elements. These
all refer to regular JavaScript statements except for `TopLevelFunctionBlock`.
This is enabled by default, with no special behaviour. When disabled (set to
`0`), esformatter will not indent top level function blocks (used by the
jQuery preset).

 - negative integer (`-1` till `-99`): decrease indent level by `[n]`.
 - `0`: don't increase or decrease indent level.
 - positive integer (`1` till `99`): increase indent level by `[n]`.

```js
{
  "indent": {
    "value": "\t",
    "FunctionExpression": 1,
    "ArrayExpression": 0,
    "ObjectExpression": 0
  }
}
```

If the `node.type` is not listed on the `indent` configuration we assume its
value is set to `0` and we won't increase/decrease the indent level of that
block/expression.

PS: we always replace the original file indentation to simplify the process,
specially because adding/removing linebreaks changes drastically the
indentation of the blocks.


## lineBreak

The default `lineBreak.value` is `"\n"`.

For `lineBreak` you can use ranges or integers:

 - `-1`: keep original line breaks.
 - `0`: remove line breaks.
 - positive integer (`1` till `99`): "add or keep `[n]` line breaks".
 - `">2"`: add linebreaks until it's over `2`.
 - `">=1"`: add line breaks until it's equal or greater than `1`.
 - `"<2"`: remove linebreaks until it's smaller than `2`.
 - `"<=1"`: remove/add line breaks until it's smaller or equal to `1`.

The property names mostly match the names used by the Abstract Syntax Tree
(AST) for JavaScript. A lot of them have "...Opening", "...Closing",
"...OpeningBrace" and "...ClosingBrace" as variants, allowing very fine grained
control over each settings.

```js
{
  "lineBreak": {
    "before": {
      "FunctionDeclaration": ">=1",
      "FunctionDeclarationOpeningBrace": 0,
      "FunctionDeclarationClosingBrace": 1
    },
    "after": {
      "FunctionDeclaration": ">=1",
      "FunctionDeclarationOpeningBrace": 1
    }
  }
}
```


## whiteSpace

The default `whiteSpace.value` is a single space (`" "`). Its
unlikely that you ever need to change this.

For `whiteSpace` you can set values to:

 - `-1`: keep the original value.
 - `0`: remove all white spaces.
 - positive integers (`1` till `99`): add/keep `[n]` spaces.

```js
{
  "whiteSpace": {
    "before": {
      "FunctionExpressionOpeningBrace": 1,
      "FunctionExpressionClosingBrace": 1
    },
    "after": {
      "FunctionExpressionOpeningBrace": 1,
      "FunctionExpressionClosingBrace": -1
    }
  }
}
```

Important to note that we don't insert white spaces at the beginning or end of
the lines, so in the above example we would only add a space before `}` if it
is **not** the first char of the line, and only insert a space after `{` if it
is not followed by a line break.


## pipe

Since we don't expect everyone to write plugins that only works with
esformatter we decided to encourage the usage of standalone CLI tools.

```js
{
  // pipe is a simple way to "pipe" multiple binaries input/output
  "pipe": {
    // scripts listed as "before" will be executed before esformatter
    // and will forward output to next command in the queue
    "before": [
      "strip-debug",
      "./bin/my-custom-script.sh --foo true -zx"
    ],
    // scripts listed as "after" will be executed after esformatter
    "after": [
      "baz --keepLineBreaks"
    ]
  }
}
```

The pipe option works by passing the string input to `stdin` of the first
executable and piping the `stdout->stdin` of each tool. The executables will be
executed in the same order as they are listed, `before` or `after` the default
`esformatter` transformations.

The `pipe` option works similar to `npm run-script`, where it locates the
locally installed executables inside the `node_modules` folder. If it can't
find a local executable it will fallback to global commands. (this allows you
to install `devDependencies` that are only used by a single project)


## plugins

Plugins are automatically loaded from `node_modules` if you pass the module id
in the config file:

```js
{
  // executes plugins in the same order as listed in the Array
  "plugins": [ "esformatter-sample-plugin", "foobar" ]
}
```

For detailed information about plugins structure and API see
[plugins.md](./plugins.md)


---


Documenting each property here wouldn't be practical. For now we recommend you
look at the [lib/preset/default.json](../lib/preset/default.json) to find the
properties you need to adjust for your specific needs. Better yet, adopt one of
the presets to avoid having to configure anything beyond the most basic
settings (like `indent.value`).

[Live preview on Requirebin](http://requirebin.com/embed?gist=0d67452e01754269660f)

