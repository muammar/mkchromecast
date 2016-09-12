# unique-temp-dir [![Build Status](https://travis-ci.org/jamestalmage/unique-temp-dir.svg?branch=master)](https://travis-ci.org/jamestalmage/unique-temp-dir)

> Provides a uniquely named temp directory.


## Install

```
$ npm install --save unique-temp-dir
```


## Usage

```js
const uniqueTempDir = require('unique-temp-dir');

uniqueTempDir();
//=> '/var/folders/2_/zg9h6_xd4r3_z7c07s0cn8mw0000gn/T/PpCfz55ANU2hdwnGzgny'

uniqueTempDir();
//=> '/var/folders/2_/zg9h6_xd4r3_z7c07s0cn8mw0000gn/T/qfqafhh1FJulehbCDAPk'
```


## API

### uniqueTempDir([options])

Returns a string that represents a unique directory inside the systems temp directory.

#### options

##### create

Type: `boolean`  
Default: `false`

If `true`, the directory will be created synchronously before returning.

##### length

Type: `number`  
Default: `20`

The length of the directory name inside the temp directory.

##### thunk

Type: `boolean`  
Default: `false`

If true, returns a thunk function for `path.join(uniqueTempDir, ... additionalArgs)`. Useful for filling your directory up with stuff.

```js                     
const uniqueTempDir = require('unique-temp-dir');
const tempDir = uniqueTempDir({thunk: true});

tempDir()
//=> /user/temp/uniqueId

tempDir('foo')
//=> /user/temp/uniqueId/foo

tempDir('bar')
//=> /user/temp/uniqueId/bar
```

## License

MIT © [James Talmage](http://github.com/jamestalmage)
