# option-chain [![Build Status](https://travis-ci.org/jamestalmage/option-chain.svg?branch=master)](https://travis-ci.org/jamestalmage/option-chain) [![Coverage Status](https://coveralls.io/repos/jamestalmage/option-chain/badge.svg?branch=master&service=github)](https://coveralls.io/github/jamestalmage/option-chain?branch=master)

> Use fluent property chains in lieu of options objects. 


## Install

```
$ npm install --save option-chain
```


## Usage

```js
const optionChain = require('option-chain');

const optionDefinition = {
  defaults: {
    bar: false
  },
  chainableMethods: {
    foo: {foo: true},
    notFoo: {foo: false},
    bar: {bar: true}
  }
};

function printOptionsAndArgs(options, args) {
  console.log(options);
  if (args.length) {
    console.log(args);
  }
}

const fn = optionChain(optionDefinition, printOptionsAndArgs);

fn();
//=> [{bar: false}]
fn.bar();
//=> [{bar: true}]
fn.foo.bar();
//=> [{foo: true, bar: false}]

fn.foo('a', 'b');
//=> [{foo: true, bar: false}]
//=> ['a', 'b']
```


## API

### optionChain(options, callback, [target])

#### options

##### chainableMethods

Type: `Object`    
*Required*

A map of chainable property names to the options set by adding property to the chain.

Given the following:

```js
const chainableMethods = {
  foo: {foo: true},
  notFoo: {foo: false},
  bar: {bar: true},
  both: {foo: true, bar: true}
}
```

Then:

- `fn.foo` would set `foo` to `true`.
- `fn.bar` would set `bar` to `true`.
- `fn.both` sets both `foo` and `bar` to `true`.
- The last property in the chain takes precedence, so `fn.foo.notFoo` would result in `foo` being `false`. 


##### defaults

Type: `Object`
Default: `{}`

A set of default starting properties.

##### spread

Type: `boolean`
Default: `false`

By default, any arguments passed to the wrapper are passed as an array to the second argument of the wrapped function. When this is `true`, additional arguments will be spread out as additional arguments:

```js
function withoutSpread(opts, args) {
  let foo = args[0];
  let bar = args[1];
  // ...
}

function withSpread(opts, foo, bar) {
  // ...
}
```

#### callback

Type: `function`

This callback is called with the accumulated options as the first argument. Depending on the value of `options.spread`, arguments passed to the wrapper will either be an array as the second argument or spread out as the 2nd, 3rd, 4th... arguments.

#### target

If supplied, the `target` object is extended with the property getters and returned. Otherwise a wrapper function is created for `options.defaults`, then that wrapper is extended and returned.

*Hint:* If you want to extend a `target` and add a method that simply uses the defaults, add a chainable method definition with an empty spec: 

```js
const chainableMethods = {
  defaultMethodName: {}
}
```

## License

MIT © [James Talmage](http://github.com/jamestalmage)
