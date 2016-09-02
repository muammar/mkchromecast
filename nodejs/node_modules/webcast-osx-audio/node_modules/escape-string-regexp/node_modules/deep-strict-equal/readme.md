# deep-strict-equal [![Build Status](https://travis-ci.org/sindresorhus/deep-strict-equal.svg?branch=master)](https://travis-ci.org/sindresorhus/deep-strict-equal)

> Test for deep equality - Node.js [`assert.deepStrictEqual()`](https://nodejs.org/api/assert.html#assert_assert_deepstrictequal_actual_expected_message) algorithm as a standalone module

*Issues and improvements should be done in [Node.js](https://github.com/nodejs/node/issues) first.*


## Install

```
$ npm install --save deep-strict-equal
```


## Usage

```js
const deepStrictEqual = require('deep-strict-equal');

deepStrictEqual({foo: {bar: [1, 2]}}, {foo: {bar: [1, 2]}});
//=> true

deepStrictEqual({foo: {bar: [1, 2]}}, {foo: {bar: [1, 4]}});
//=> false
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
