# is-js-type
[![NPM version](https://badge.fury.io/js/is-js-type.svg)](https://badge.fury.io/js/is-js-type) [![Build Status](https://travis-ci.org/dustinspecker/is-js-type.svg)](https://travis-ci.org/dustinspecker/is-js-type) [![Coverage Status](https://img.shields.io/coveralls/dustinspecker/is-js-type.svg)](https://coveralls.io/r/dustinspecker/is-js-type?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/is-js-type/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/is-js-type) [![Dependencies](https://david-dm.org/dustinspecker/is-js-type.svg)](https://david-dm.org/dustinspecker/is-js-type/#info=dependencies&view=table) [![DevDependencies](https://david-dm.org/dustinspecker/is-js-type/dev-status.svg)](https://david-dm.org/dustinspecker/is-js-type/#info=devDependencies&view=table)

> Is string a JS Type

**Uses [Sindre Sorhus](https://github.com/sindresorhus)' [js-types](https://github.com/sindresorhus/js-types)**

## Install
```
npm install --save is-js-type
```

## Usage
### ES2015
```javascript
import isJsType from 'is-js-type';

isJsType('array');
// => true

isJsType('Error');
// => true

isJsType('dog');
// => false
```

### ES5
```javascript
var isJsType = require('is-js-type');

isJsType('array');
// => true

isJsType('Error');
// => true

isJsType('dog');
// => false
```

## LICENSE
MIT © [Dustin Specker](https://github.com/dustinspecker)
