# ava-files [![Build Status](https://travis-ci.org/avajs/ava-files.svg?branch=master)](https://travis-ci.org/avajs/ava-files) [![Coverage Status](https://coveralls.io/repos/github/avajs/ava-files/badge.svg?branch=master)](https://coveralls.io/github/avajs/ava-files?branch=master)

> File resolution for [AVA](https://ava.li)


## Install

```
$ npm install --save ava-files
```


## Usage

```js
const AvaFiles = require('ava-files');

const avaFiles = new AvaFiles({
  cwd: '/path/to/cwd',
  files: ['**/glob/patterns/**'],
  sources: ['**/glob/patterns/**']
});

const isTest = avaFiles.makeTestMatcher();

isTest(filePath);
//=> true or false

const isSource = avaFiles.makeSourceMatcher();

isSource(filePath);
//=> true or false

avaFiles.findTestFiles().then(files => {
  // files is an array of found test files
});
```


## API

### avaFiles = new AvaFiles([options])

#### options

##### files

Type: `Array` of `string` glob patterns

Default:

```js
[
  'test.js',
  'test-*.js',
  'test',
  '**/__tests__',
  '**/*.test.js',
  '!**/node_modules/**',
  '!**/fixtures/**',
  '!**/helpers/**'
]
```

##### sources

Type: `Array` of `string` glob patterns<br>
Default: empty array

##### cwd

Type: `string`<br>
Default: `process.cwd()`

The base directory to search for files from

### avaFiles.makeTestMatcher()

Creates a filter function that matches test paths

### avaFiles.makeSourceMatcher()

Creates a filter function that matches source paths

### avaFiles.findTestFiles()

Returns a promise for an array of string paths to the found test files

## License

MIT © [James Talmage](http://github.com/avajs)
