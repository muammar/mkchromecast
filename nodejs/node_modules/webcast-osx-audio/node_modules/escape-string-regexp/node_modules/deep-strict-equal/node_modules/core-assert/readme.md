# core-assert [![Build Status](https://travis-ci.org/sindresorhus/core-assert.svg?branch=master)](https://travis-ci.org/sindresorhus/core-assert)

> Node.js [`assert`](https://nodejs.org/api/assert.html) as a standalone module

Useful to ensure consistency between Node.js versions as the `assert` module has changed a lot.

Lets you use the Node.js 4.0 `assert.deepStrictEqual()`/`assert.notDeepStrictEqual()` methods all the way back to Node.js 0.10.

*Issues and improvements should be done in [Node.js](https://github.com/nodejs/node/issues) first.*


## Install

```
$ npm install --save core-assert
```


## Usage

```js
var assert = require('core-assert');

assert.strictEqual('unicorn', 'unicorn');
```


## Related

- [deep-strict-equal](https://github.com/sindresorhus/deep-strict-equal) - Test for deep equality - Node.js `assert.deepStrictEqual()` algorithm as a standalone module


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
