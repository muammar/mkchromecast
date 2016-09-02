# `evalmd`

[![Build Status](https://travis-ci.org/reggi/evalmd.svg?branch=master)](https://travis-ci.org/reggi/evalmd) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Write javascript in your markdown & execute it. I wanted a way of making sure the javscript that I write in markdown was valid and worked, not only for my own sake, but to ensure the examples and code provided was valid for others to reliably refer to.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->


- [Usage](#usage)
- [Testing](#testing)
- [Install](#install)
- [Current Module Definition](#current-module-definition)
- [Preventing Eval](#preventing-eval)
- [Prepend Flag](#prepend-flag)
- [Inspiration](#inspiration)
- [Todo](#todo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Usage

`evalmd` will scan a markdown file searching for a javascript code declaration, all of them are gathered then the string sent to [`eval`](https://github.com/pierrec/node-eval).

    ```javascript
    ```

or

    ```js
    ```

## Options

```
evalmd - Evaluate the javascript in markdown files

Options:
  -i, --include    Includes prevented blocks  [default: false]
  -P, --prevent    Prevent code from being evaluated  [default: false]
  -b, --block      Change the scope to block level  [default: false]
  -o, --output     Output js  [choices: false, true, "preserve", "concat", "preserveAlter", "concatAlter"] [default: false]
  -n, --nonstop    Runs all files regardless if error  [default: false]
  -s, --silent     Silence `evalmd` logging  [default: false]
  -u, --uniform    Does not use absolute urls when error logging  [default: false]
  -D, --debug      Debug Output  [default: false]
  -h, --help       Show help  [boolean]
  --path           Prefix local module with path  [default: "./"]
  --package        Th path of a package.json  [default: "./package.json"]
  --version        Show version number  [boolean]
  -d, --delimeter  [default: false]

Examples:
  evalmd <file(s)>        Evaluate file(s)
  evalmd <file(s)> -n     Evaluate file(s) uninterrupted
  evalmd <file(s)> -b     Evaluate block(s)
  evalmd <file(s)> -bn    Evaluate block(s) uninterrupted
  evalmd <file(s)> -Po    Outputs js file(s)
  evalmd <file(s)> -Pio   Outputs js file(s) with all block(s) (for linting)
  evalmd <file(s)> -Pob   Outputs block(s)
  evalmd <file(s)> -Piob  Outputs all blocks(s) (for linting)
```

## Testing

Here is a bit of javascript that has an assertion at the end of it. The assertion will throw an error if the result of the `.equal` is invalid. This file is used as a test to see if `evalmd` is in working order.

```javascript
var assert = require('assert')
var helloWorld = 'foo'
assert.equal(helloWorld, 'foo')
```

Here's another one:

```js
var assert = require('assert')
var helloWorld = ['foo', 'bar']
assert.deepEqual(helloWorld, ['foo', 'bar'])
```

If you run this file using `test-markdown` it will exit with a status code of `0`, meaning no exceptions where thrown.

This overall provides a different way of sharing and explaining code, because it's much more formal then a complicated test file.

## Install

Try it yourself by executing the command:

```bash
npm install evalmd -g
evalmd ./readme.md
```

## Current Module Definition

If the command is ran within a node module with a `package.main` and a `package.name` then that reference will be replaced throughout your code. For instance the following passes.

```javascript
var evalmd = require('evalmd')
assert.equal(typeof evalmd, 'function')
```

## Prevent Eval Declaration

The `preventEval` declaration allows you to prevent a code block from being evaluated.  There are two different ways of declaring a code block. One is to use an `anchor`. Here's an example:

    [](#preventEval)
    ```js
    module.exports = 'alpha-path'
    ```

When adding a `preventEval` declaration in this way the name of the file is the `text` content of the anchor. Another way to declare a block as a file is using a comment. Here's an example:

    ```js
    // preventEval
    module.exports = 'alpha-path'
    ```

When the first line of a code block is a comment with the word `preventEval` in front the string after will be interpreted as the file.

> Note. The match patterns for `prevent eval` and `preventEval` are case-insensitive. So `pReVenTeVaL` works just as well.

# File Eval Declaration

The `fileEval` declaration allows you to define a code block as a file. There are two different ways of declaring a code block. One is to use an `anchor` tag with the `href` set to `#fileEval`. Here's an example:

    This is the file [./alpha.js](#fileEval).

    ```js
    module.exports = 'alpha-path'
    ```

When adding a `fileEval` declaration in this way the name of the file is the `text` content of the anchor. Another way to declare a block as a file is using a comment. Here's an example:

    ```js
    // fileEval ./alpha.js
    module.exports = 'alpha-path'
    ```

When the first line of a code block is a comment with the word `fileEval` in front the string after will be interpreted as the file.

> Note. If any of the code blocks in a file contain a `fileEval` declaration then the entire file will be run as `blockScope`.

> Note. The match patterns for `file eval` and `fileEval` are case-insensitive. So `fILeEvAl` works just as well.

## Prepend Flag

If you want to run code from `docs`, and your javscript files are in the root directory, you can use the `--prepend` flag to prepend every local module reference with the value.

Let's say you run the command:

```bash
evalmd ./docs/my-document.md --prepend='..'
```

And you have `my-document.md` with the conents:

    ```javascript
    var alpha = require('./alpha.js')
    ```

The prepend command will transform this code to this before it executes it.

    ```javascript
    var alpha = require('../alpha.js')
    ```

> Note: it's a prepend `path.join()` string, and not a concatenated prepend.

## Inspiration

I wanted a way of writing unit tests in markdown. I've been playing around with things like [`yamadapc/jsdoctest`](https://github.com/yamadapc/jsdoctest) which parses `JSDoc` declarations looking for `@example` keywords in source code and creates a test based on them.

## Todo

* Add ability for custom linting support (<3 [`standard`](https://github.com/feross/standard#standardlinttexttext-opts-callback))
