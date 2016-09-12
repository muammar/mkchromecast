# ava-init [![Build Status: Linux](https://travis-ci.org/avajs/ava-init.svg?branch=master)](https://travis-ci.org/avajs/ava-init) [![Build status: Windows](https://ci.appveyor.com/api/projects/status/abj17qsw0j1rts7l/branch/master?svg=true)](https://ci.appveyor.com/project/ava/ava-init/branch/master)

> Add [AVA](https://ava.li) to your project


## Install

```
$ npm install --save ava-init
```


## Usage

```js
const avaInit = require('ava-init');

avaInit().then(() => {
	console.log('done');
});
```


## API

### avaInit([options])

Returns a `Promise`.

#### options

#### cwd

Type: `string`<br>
Default: `'.'`

Current working directory.

#### args

Type: `Array`<br>
Default: CLI arguments *(`process.argv.slice(2)`)*

For instance, with the arguments `['--foo', '--bar']`, the following will be put in package.json:

```json
{
	"name": "awesome-package",
	"scripts": {
		"test": "ava --foo --bar"
	}
}
```


## CLI

Install AVA globally `$ npm install --global ava` and run `$ ava --init [<options>]`.


## License

MIT © [Sindre Sorhus](https://sindresorhus.com)
