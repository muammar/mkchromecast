# max-timeout [![Build Status](https://travis-ci.org/sindresorhus/max-timeout.svg?branch=master)](https://travis-ci.org/sindresorhus/max-timeout)

> The max amount of milliseconds you can pass to `setTimeout()`

A value larger than the one returned from this module, 2147483647 (~25 days), is too big to fit into a signed 32-bit integer, which is how JS engines store it, and will cause overflow, resulting in the timeout being scheduled immediately.


## Install

```
$ npm install --save max-timeout
```


## Usage

```js
const maxTimeout = require('max-timeout');

setTimeout(() => {}, maxTimeout);
```


## Related

- [delay](https://github.com/sindresorhus/delay) - Delay a promise a specified amount of time


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
