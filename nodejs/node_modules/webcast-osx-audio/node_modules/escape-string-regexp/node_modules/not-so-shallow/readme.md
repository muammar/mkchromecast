# not-so-shallow

> A less shallow [`only-shallow`](https://github.com/othiym23/only-shallow)

[![Build Status](https://travis-ci.org/sotojuan/not-so-shallow.svg?branch=master)](https://travis-ci.org/sotojuan/not-so-shallow)

This is just [`only-shallow`](https://github.com/othiym23/only-shallow) but with strict equality for value types.

## Install

```
$ npm install --save not-so-shallow
```

## Usage

```js
let notSoShallow = require('not-so-shallow')

notSoShallow({a: 0}, {a: false}) // false
notSoShallow({a: 0}, {a: '0'}) // false
notSoShallow({a: 1}, {a: 1}) // true
notSoShallow({a: 1, b: 2}, {b: 2, a: 1}) // true
```

## API

### notSoShallow(a, b)

Returns `true` if `a` and `b` are the same according to the algorithm, which is
explained in the comments of [`index.js`](https://github.com/sotojuan/not-so-shallow/blob/master/index.js).

## License

MIT © [Juan Soto](http://juansoto.me)
