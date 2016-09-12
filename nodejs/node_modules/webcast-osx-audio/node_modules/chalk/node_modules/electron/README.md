# Electron [![Build Status](https://secure.travis-ci.org/logicalparadox/electron.png?branch=master)](http://travis-ci.org/logicalparadox/electron)

> A simple command-line interface framework for [node.js](http://nodejs.org).

#### Features

- reimagined `process.argv` parsing utility
- framework for single or multiple command programs
- automatic `--help` command generation with multiple theming options
- built in cli coloring 
- chainable api

## Quick Start Guide

This "Quick Start Guide" and the full API reference can be found 
on [electron's documentation website](http://alogicalparadox.com/electron).

#### Installation

The `electron` package is available through [npm](http://npmjs.org). It is recommended
that you add it to your project's `package.json`.

```bash
npm install electron
```

#### Parsing Arguments

The argument parsing utility can be used independently of the program
framework. Just pass the `process.argv` from any node modules and your
ready to go.

The following command execution...

```bash
$ node cli.js build --minify --out saved.min.js
```

Could be captured as so...

```javascript
var argv = require('electron').argv();

// objects
argv.commands;               // [ 'build' ]
argv.modes;                  // [ 'minify' ]
argv.params;                 // { out: 'saved.min.js' }

// helpers
argv.command('build');       // true
argv.mode('m', 'minify');    // true
argv.param('o', 'out');      // 'saved.min.js'
```

Recommend reading the "Argument Parsing Utility" section of the 
[documentation](http://alogicalpardox.com/electron)
to learn about the methodologies and specifics of each of the helpers.

#### Your First Program

To construct your first program, simply execute the electron export
with a parameter of the namespace you wish to use for your program.
Then proceed to define your settings and commands.

```javascript
var myApp = require('../lib/myapp')
  , program = require('electron')('myapp');

/**
 * Define your program settings
 */

program
  .name('My Cool App')
  .desc('http://docs.mycoolapp.com')
  .version(myApp.version);

/**
 * Define your first command
 */

program
  .command('build')
  .desc('start a build task')
  .option('-m, --minify', 'flag to set enable minification')
  .option('-o, --out [file.js]', 'name of output file')
  .action(function (argv) {
    var minify = argv.mode('m', 'minify')
      , savefile = argv.param('o', 'out')
      , cwd = argv.cwd;

   program.colorize();
   console.log('Welcome to myApp'.gray + myApp.version);
   console.log('It works if it ends with '.gray + 'myApp ' + 'ok'.green);
   // etc...
  });

/**
 * Parse argv and execute respective command
 */

program.parse();
```

Your `-h, --help` and `-v, --version` will be generated for you automatically.

Recommend reading the "Program Framework" and "Constructing Commands" sections
of the [documentation](http://alogicalpardox.com/electron)
to learn about all of the available chainable commands and theming options 
available to construct your programs.

## Tests

Tests are writting in [Mocha](http://github.com/visionmedia/mocha) using 
the [Chai](http://chaijs.com) `should` BDD assertion library. To make sure you 
have that installed, clone this repo, install dependacies using `npm install`.

    $ npm test

## Contributors

Interested in contributing? Fork to get started. Contact [@logicalparadox](http://github.com/logicalparadox) 
if you are interested in being regular contributor.

* Jake Luer ([@logicalparadox](http://github.com/logicalparadox))

## License

(The MIT License)

Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
