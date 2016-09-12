# the-argv

[![NPM version][npm-image]][npm-url] [![js-xo-style][codestyle-image]][codestyle-url]

> The part of argv you want

No need to remember how to get those cli arguments anymore...


## Installation

Install `the-argv` using [npm](https://www.npmjs.com/):

```bash
npm install --save the-argv
```

## Usage

### Module usage

```javascript
var theArgv = require('the-argv');

// process.argv = ['/usr/local/bin/node', 'index.js', '--flag', 'arg']

console.log(theArgv());
// outputs: ['--flag', 'arg']
```

#### Example with [`minimist`](https://www.npmjs.com/package/minimist)

```javascript
var argv = require('minimist')(require('the-argv')());

// ...
```

## License

MIT

[npm-url]: https://npmjs.org/package/the-argv
[npm-image]: https://badge.fury.io/js/the-argv.svg
[codestyle-url]: https://github.com/sindresorhus/xo
[codestyle-image]: https://img.shields.io/badge/code%20style-xo-brightgreen.svg?style=flat
