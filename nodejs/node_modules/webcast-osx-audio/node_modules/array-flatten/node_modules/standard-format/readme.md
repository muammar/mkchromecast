
# standard-format

  [![Build Status](https://travis-ci.org/maxogden/standard-format.svg)](https://travis-ci.org/maxogden/standard-format)
  [![Dependency Status](https://david-dm.org/maxogden/standard-format.svg?style=flat-square)](https://david-dm.org/maxogden/standard-format)

  **experimental** auto formatter for the easier cases in [standard](https://www.npmjs.com/package/standard)

  [![NPM](https://nodei.co/npm/standard-format.png)](https://nodei.co/npm/standard-format/)

## Installation

  Install with npm

    $ npm install -g standard-format

## Example Usage

  Output all formatted javascript in a directory and subdirectories to stdout

    $ standard-format

  Format all javascript files, overwriting them into standard format

    $ standard-format -w

  Format javascript over stdin

    $ standard-format < file.js > formatted-file.js

  Format and overwrite specific files

    $ standard-format -w file1.js file2.js

### Editor plugins

  - Sublime Text: [sublime-standard-format](https://packagecontrol.io/packages/StandardFormat)
  - Atom: [atom-standard-formatter](https://atom.io/packages/standard-formatter)

### Science :mortar_board:

  > A new step should be added to the modification cycle: modifying the program to make it readable.

  [Elshoff & Marcotty, 1982](http://dl.acm.org/citation.cfm?id=358596)
