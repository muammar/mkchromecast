# esformatter

[![Build Status](https://secure.travis-ci.org/millermedeiros/esformatter.svg?branch=master)](https://travis-ci.org/millermedeiros/esformatter)

ECMAScript code beautifier/formatter.

[Live preview on Requirebin](http://requirebin.com/embed?gist=0d67452e01754269660f)


## Important

This tool is still missing support for many important features. Please report
any bugs you find, the code is only as good as the test cases. Feature requests
are very welcome.

**We are looking for [contributors](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)!!**



## Why?

[jsbeautifier.org](http://jsbeautifier.org/) doesn't have enough options and
not all IDEs/Editors have a good JavaScript code formatter. I would like to
have a command line tool (and standalone lib) as powerful/flexible as the
[WebStorm](http://www.jetbrains.com/webstorm/) and
[FDT](http://fdt.powerflasher.com/) code formatters so that it can be plugged
into any editor and reused by other tools like
[escodegen](https://github.com/Constellation/escodegen/).

For more reasoning behind it and history of the project see: [esformatter
& rocambole](http://blog.millermedeiros.com/esformatter-rocambole/)



## How?

This tool uses [rocambole](https://github.com/millermedeiros/rocambole) and
[espree](https://github.com/eslint/espree) to recursively parse the tokens and
transform it *in place*.



## Goals

 - *granular* control about white spaces, indent and line breaks.
 - command line interface (cli).
 - be non-destructive.
 - support for local/global config file so settings can be shared between team
   members.
 - be extensive ([plugins](https://github.com/millermedeiros/esformatter/wiki/Plugins)
   and other cli tools).
 - support most popular style guides through plugins (Google, jQuery,
   Idiomatic.js).
 - be the best JavaScript code formatter!



## API

```js
var esformatter = require('esformatter');
var fs = require('fs');
var codeStr = fs.readFileSync('path/to/js/file.js').toString();

// for a list of available options check "lib/preset/default.json"
var options = {
  indent : {
    value : '  '
  },
  lineBreak : {
    before : {
      // at least one line break before BlockStatement
      BlockStatement : '>=1',
      // only one line break before DoWhileStatementOpeningBrace
      DoWhileStatementOpeningBrace : 1,
      // ...
    }
  },
  whiteSpace : {
    // ...
  }
};

// return a string with the formatted code
var formattedCode = esformatter.format(codeStr, options);
```

See the [doc/api.md](./doc/api.md) file for a list of all the public methods
and detailed documentation about each one.

See [doc/config.md](./doc/config.md) for more info about the configuration
options.


## CLI

You can also use the simple command line interface to process the `stdin` or
read from a file.

```sh
npm install [-g] esformatter
```

### Usage:

Pass the `--help` flag to see the available options or see
[doc/cli.txt](./doc/cli.txt).

```sh
esformatter --help
```

### Examples:

```sh
# Format
# ======

# format "test.js" and output result to stdout
esformatter test.js
# you can also pipe other shell commands (read file from stdin)
cat test.js | esformatter
# format "test.js" using options in "options.json" and output result to stdout
esformatter --config options.json test.js
# process "test.js" and writes to "test.out.js"
esformatter test.js > test.out.js
# you can override the default settings, see lib/preset/default.json for
# a list of available options
esformatter test.js --indent.value="\t" --lineBreak.before.IfStatementOpeningBrace=0
# format "test.js" and output result to "test.js"
esformatter -i test.js
# format and overwrite all the ".js" files inside the "lib/" folder
esformatter -i 'lib/*.js'
# format and overwrite all the ".js" files inside "lib/" and it's subfolders
esformatter -i 'lib/**/*.js'

**important:** surround the glob with single quotes to avoid expansion; [glob
syntax reference](https://github.com/isaacs/node-glob/#glob-primer)

# Diff
# ======

# check if "test.js" matches style and output diff to stdout
esformatter --diff test.js
# check if "test.js" matches style and output unified diff to stdout
esformatter --diff-unified test.js
# check if "test.js" matches "options.json" style and output diff to stdout
esformatter --diff --config options.json test.js
# check all files inside "lib/" and it's subfolders
esformatter --diff 'lib/**/*.js'
```

### Local version

If a locally installed `esformatter` is found, the CLI uses that instead of the
global executable (this means you can have multiple projects depending on
different versions of esformatter).

**protip:** add `esformatter` and all the plugins that you need on your project
to the [package.json `devDependencies`](https://docs.npmjs.com/files/package.json#devdependencies)
that way you can use locally installed plugins and also make sure everyone on
your team is using the same version/settings.

```json
{
  "devDependencies": {
    "esformatter": "~0.6.0",
    "esformatter-quotes": "^1.0.1"
  },
  "esformatter": {
    "plugins": ["esformatter-quotes"],
    "quotes": {
      "type": "single"
    }
  }
}
```



## IDE / Editor integration

Since esformatter is available as a command-line tool, it can be used in any editor that supports external shell commands.

- Vim - [vim-esformatter](https://github.com/millermedeiros/vim-esformatter)
- Vim - [https://gist.github.com/nisaacson/6939960](https://gist.github.com/nisaacson/6939960)
- Sublime Text - [sublime-esformatter](https://github.com/piuccio/sublime-esformatter)
- Atom - [atom-esformatter](https://github.com/sindresorhus/atom-esformatter)




## Configuration

See [doc/config.md](./doc/config.md).


## Pipe other CLI tools

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

## Plugins

Plugins are automatically loaded from `node_modules` if you pass the module id
in the config file:

```json
{
  "plugins": [ "esformatter-sample-plugin", "foobar" ]
}
```

List of plugins and plugins wish list:
https://github.com/millermedeiros/esformatter/wiki/Plugins

List of plugins with easy filterable search:
http://pgilad.github.io/esformatter-plugins/

For detailed information about plugins structure and API see
[doc/plugins.md](./doc/plugins.md)


## IRC

We have an IRC channel [#esformatter on
irc.freenode.net](http://webchat.freenode.net/?channels=esformatter) for quick
discussions about the project development/structure.


## Wiki

See project Wiki for more info: https://github.com/millermedeiros/esformatter/wiki



## Project structure / Contributing

See [CONTRIBUTING.md](https://github.com/millermedeiros/esformatter/blob/master/CONTRIBUTING.md)



## Popular Alternatives

 - [jsbeautifier](http://jsbeautifier.org/)
 - [codepainter](https://npmjs.org/package/codepainter)
 - [jscs](http://jscs.info/)



## License

Released under the MIT license


