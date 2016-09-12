# is-get-set-prop
[![NPM version](https://badge.fury.io/js/is-get-set-prop.svg)](https://badge.fury.io/js/is-get-set-prop) [![Build Status](https://travis-ci.org/dustinspecker/is-get-set-prop.svg)](https://travis-ci.org/dustinspecker/is-get-set-prop) [![Coverage Status](https://img.shields.io/coveralls/dustinspecker/is-get-set-prop.svg)](https://coveralls.io/r/dustinspecker/is-get-set-prop?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/is-get-set-prop/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/is-get-set-prop) [![Dependencies](https://david-dm.org/dustinspecker/is-get-set-prop.svg)](https://david-dm.org/dustinspecker/is-get-set-prop/#info=dependencies&view=table) [![DevDependencies](https://david-dm.org/dustinspecker/is-get-set-prop/dev-status.svg)](https://david-dm.org/dustinspecker/is-get-set-prop/#info=devDependencies&view=table)

> Does a JS type have a getter/setter property

## Install
```
npm install --save is-get-set-prop
```

## Usage
### ES2015
```javascript
import isGetSetProp from 'is-get-set-prop';

isGetSetProp('array', 'length');
// => true

isGetSetProp('ARRAY', 'push');
// => false

// is-get-set-prop can only verify native JS types
isGetSetProp('gulp', 'task');
// => false;
```

### ES5
```javascript
var isGetSetProp = require('is-get-set-prop');

isGetSetProp('array', 'length');
// => true

isGetSetProp('ARRAY', 'push');
// => false

// is-get-set-prop can only verify native JS types
isGetSetProp('customObject', 'customGetterOrSetter');
// => false;
```

## API
### isGetSetProp(type, propertyName)
#### type
Type: `string`

A native JS type to examine. Note: `is-get-set-prop` can only verify native JS types.

#### propertyName
Type: `string`

Property name to determine if a getter/setter of `type`.

## LICENSE
MIT © [Dustin Specker](https://github.com/dustinspecker)
