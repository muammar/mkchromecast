# write-json-file [![Build Status](https://travis-ci.org/sindresorhus/write-json-file.svg?branch=master)](https://travis-ci.org/sindresorhus/write-json-file)

> Stringify and write JSON to a file [atomically](https://github.com/iarna/write-file-atomic)

Creates directories for you as needed.


## Install

```
$ npm install --save write-json-file
```


## Usage

```js
const writeJsonFile = require('write-json-file');

writeJsonFile('foo.json', {foo: true}).then(() => {
	console.log('done');
});
```


## API

### writeJsonFile(filepath, data, [options])

Returns a promise.

### writeJsonFile.sync(filepath, data, [options])

#### options

##### indent

Type: `string`, `number`  
Default: `\t`

Indentation as a string or number of spaces.  
Pass in `null` for no formatting.

##### sortKeys

Type: `boolean`, `function`  
Default: `false`

Sort the keys recursively.  
Optionally pass in a [`compare`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort) function.

##### replacer

Type: `function`

Passed into [`JSON.stringify`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify#The_replacer_parameter).

##### mode

Type: `number`  
Default `438` *(0666 in octal)*

[Mode](https://en.wikipedia.org/wiki/File_system_permissions#Numeric_notation) used when writing the file.


## Related

- [load-json-file](https://github.com/sindresorhus/load-json-file) - Read and parse a JSON file


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
