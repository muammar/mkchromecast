# write-pkg [![Build Status](https://travis-ci.org/sindresorhus/write-pkg.svg?branch=master)](https://travis-ci.org/sindresorhus/write-pkg)

> Write a `package.json` file

Writes atomically and creates directories for you as needed.


## Install

```
$ npm install --save write-pkg
```


## Usage

```js
var path = require('path');
var writePkg = require('write-pkg');

writePkg({foo: true}).then(function () {
	console.log('done');
});

writePkg(__dirname, {foo: true}).then(function () {
	console.log('done');
});

writePkg(path.join('unicorn', 'package.json'), {foo: true}).then(function () {
	console.log('done');
});
```


## API

### writePkg([path], data)

Returns a promise.

### readPkg.sync([path], data)

#### path

Type: `string`  
Default: `.`

Path to where the `package.json` file should be written or its directory.


## Related

- [read-pkg](https://github.com/sindresorhus/read-pkg) - Read a `package.json` file
- [write-json-file](https://github.com/sindresorhus/write-json-file) - Stringify and write JSON to a file atomically


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
