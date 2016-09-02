# protochain

[![Build Status](https://travis-ci.org/timoxley/protochain.svg?branch=master)](https://travis-ci.org/timoxley/protochain)

Get the prototype chain of an object or primitive as an Array.

## Why

I often write this function, figure I should extract it. There are
probably other utilities out there that do this but I couldn't find
them so they're either poorly named/described or the search algorithm is not being very helpful or I simply searched for the wrong things.

## Installation

```
> npm install protochain
```

## Usage

### ES5

```js
var protochain = require('protochain')

protochain({})
// => [Object.prototype]

protochain(Object.create(null))
// => []

protochain(new Error('message'))
// => [Error.prototype, Object.prototype]

protochain(new TypeError('message'))
// => [TypeError.prototype, Error.prototype, Object.prototype]

// Inheritance

function Person() {

}

function FancyPerson() {
  Person.call(this)
}

FancyPerson.prototype = Object.create(Person.prototype)

protochain(new Person())
// => [Person.prototype, Object.prototype]

protochain(new FancyPerson())
// => [FancyPerson.prototype, Person.prototype, Object.prototype]

// Primitives are OK

protochain(123)
// => [Number.prototype, Object.prototype]

protochain('abc')
// => [String.prototype, Object.prototype]

protochain(/abc/)
// => [RegExp.prototype, Object.prototype]

protochain(true)
// => [Boolean.prototype, Object.prototype]

protochain(false)
// => [Boolean.prototype, Object.prototype]

// Null & Undefined === Empty List

protochain(null)
// => []

protochain(undefined)
// => []

protochain()
// => []
```

### ES6

```js

import protochain from 'protochain'

class Person {}
class FancyPerson extends Person {}

protochain(new Person())
// => [Person.prototype, Object.prototype]

protochain(new FancyPerson())
// => [FancyPerson.prototype, Person.prototype, Object.prototype])

```

## License

MIT
