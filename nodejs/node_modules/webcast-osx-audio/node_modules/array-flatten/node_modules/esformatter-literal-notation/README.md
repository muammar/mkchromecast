# esformatter-literal-notation [![Build Status](https://travis-ci.org/kewah/esformatter-literal-notation.svg?branch=master)](https://travis-ci.org/kewah/esformatter-literal-notation)

[esformatter](https://github.com/millermedeiros/esformatter) plugin that converts array and object constructors to literal notations

```js
var foo = new Array();
// converted to:
var foo = [];

var bar = new Object();
// converted to:
var bar = {};
```

## Install

With [npm](http://npmjs.org) do:

```bash
$ npm install esformatter-literal-notation
```

## Usage

esformatter config file:

```json
{
  "plugins": [
    "esformatter-literal-notation"
  ]
}
```

## License

MIT
