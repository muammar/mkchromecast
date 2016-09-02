# resolve-cwd [![Build Status](https://travis-ci.org/sindresorhus/resolve-cwd.svg?branch=master)](https://travis-ci.org/sindresorhus/resolve-cwd)

> Resolve the path of a module like [`require.resolve()`](http://nodejs.org/api/globals.html#globals_require_resolve) but from the current working directory

Unlike `require.resolve()` it returns `null` instead of throwing when the module can't be found.


## Install

```
$ npm install --save resolve-cwd
```


## Usage

```js
const resolveCwd = require('resolve-cwd');

console.log(__dirname);
//=> '/Users/sindresorhus/rainbow'

console.log(process.cwd());
//=> '/Users/sindresorhus/unicorn'

resolveCwd('./foo');
//=> '/Users/sindresorhus/unicorn/foo.js'
```


## API

### resolveCwd(moduleId)

#### moduleId

Type: `string`

What you would use in `require()`.


## Related

- [resolve-from](https://github.com/sindresorhus/resolve-from) - Resolve the path of a module from a given path
- [req-from](https://github.com/sindresorhus/req-from) - Require a module from a given path
- [req-cwd](https://github.com/sindresorhus/req-cwd) - Require a module from the current working directory
- [lazy-req](https://github.com/sindresorhus/lazy-req) - Require modules lazily


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
