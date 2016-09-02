'use strict'

const test = require('tape')
const protochain = require('./')

test('protochain', t => {
  t.test('finds correct prototype chain', t => {
    const obj = {}
    strictEqualArray(t, protochain(obj), [Object.prototype])
    strictEqualArray(t, protochain(Object.create(obj)), [obj, Object.prototype])
    strictEqualArray(t, protochain(new Error('message')), [Error.prototype, Object.prototype])
    strictEqualArray(t, protochain(new TypeError('message')), [TypeError.prototype, Error.prototype, Object.prototype])
    /* eslint-disable no-new-wrappers */
    strictEqualArray(t, protochain(new String()), [String.prototype, Object.prototype])
    strictEqualArray(t, protochain(new Number()), [Number.prototype, Object.prototype])
    /* eslint-enable no-new-wrappers */
    /* eslint-disable no-new-func */
    strictEqualArray(t, protochain(new Function()), [Function.prototype, Object.prototype])
    /* eslint-enable no-new-func */
    strictEqualArray(t, protochain(new RegExp('abc')), [RegExp.prototype, Object.prototype])
    strictEqualArray(t, protochain(new Date()), [Date.prototype, Object.prototype])
    t.end()
  })

  t.test('null prototype is handled correctly', t => {
    const noProtoObject = Object.create(null)
    strictEqualArray(t, protochain(noProtoObject), [])
    strictEqualArray(t, protochain(Object.create(noProtoObject)), [noProtoObject])
    t.end()
  })

  t.test('falsey valueOf', t => {
    const obj = {
      valueOf () {
        return false
      }
    }

    strictEqualArray(t, protochain(obj), [Object.prototype])
    t.end()
  })

  t.test('non-object values cooerce to object counterparts correctly', t => {
    strictEqualArray(t, protochain(function () {}), [Function.prototype, Object.prototype])
    strictEqualArray(t, protochain('abc'), [String.prototype, Object.prototype])
    strictEqualArray(t, protochain(123), [Number.prototype, Object.prototype])
    strictEqualArray(t, protochain(/abc/), [RegExp.prototype, Object.prototype])
    strictEqualArray(t, protochain(true), [Boolean.prototype, Object.prototype])
    t.test('falsey values with prototypes', t => {
      strictEqualArray(t, protochain(NaN), [Number.prototype, Object.prototype])
      strictEqualArray(t, protochain(false), [Boolean.prototype, Object.prototype])
      strictEqualArray(t, protochain(''), [String.prototype, Object.prototype])
      strictEqualArray(t, protochain(0), [Number.prototype, Object.prototype])
      t.end()
    })
    t.end()
  })

  t.test('null values produce empty list', t => {
    strictEqualArray(t, protochain(), [])
    strictEqualArray(t, protochain(undefined), [])
    strictEqualArray(t, protochain(null), [])
    t.end()
  })

  t.test('ES5 inheritance', t => {
    function Person () {}
    function FancyPerson () {
      Person.call(this)
    }
    FancyPerson.prototype = Object.create(Person.prototype)

    strictEqualArray(t, protochain(new Person()), [Person.prototype, Object.prototype])
    strictEqualArray(t, protochain(new FancyPerson()), [FancyPerson.prototype, Person.prototype, Object.prototype])
    t.end()
  })

  t.test('ES6 inheritance', t => {
    // note this will be compiled to ES5 in the test
    class Person {}
    class FancyPerson extends Person {}

    strictEqualArray(t, protochain(new Person()), [Person.prototype, Object.prototype])
    strictEqualArray(t, protochain(new FancyPerson()), [FancyPerson.prototype, Person.prototype, Object.prototype])
    t.end()
  })

  // new native types which may not be supported
  if (typeof Symbol !== 'undefined') {
    t.test('symbol support', t => {
      const foo = Symbol('foo')
      strictEqualArray(t, protochain(foo), [Symbol.prototype, Object.prototype])
      t.end()
    })
  }

  if (typeof Promise !== 'undefined') {
    t.test('promise support', t => {
      const foo = Promise.resolve()
      strictEqualArray(t, protochain(foo), [Promise.prototype, Object.prototype])
      t.end()
    })
  }

  if (typeof Map !== 'undefined') {
    t.test('collections support', t => {
      strictEqualArray(t, protochain(new Map()), [Map.prototype, Object.prototype])
      strictEqualArray(t, protochain(new Set()), [Set.prototype, Object.prototype])
      strictEqualArray(t, protochain(new WeakMap()), [WeakMap.prototype, Object.prototype])
      strictEqualArray(t, protochain(new WeakSet()), [WeakSet.prototype, Object.prototype])
      t.end()
    })
  }

  if (typeof Uint8Array !== 'undefined') {
    t.test('typed array support', t => {
      const TypedArray = Object.getPrototypeOf(Int8Array.prototype)
      strictEqualArray(t, protochain(new Int8Array()), [Int8Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Uint8Array()), [Uint8Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Uint8ClampedArray()), [Uint8ClampedArray.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Int16Array()), [Int16Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Int32Array()), [Int32Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Uint32Array()), [Uint32Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Float32Array()), [Float32Array.prototype, TypedArray, Object.prototype])
      strictEqualArray(t, protochain(new Float64Array()), [Float64Array.prototype, TypedArray, Object.prototype])
      t.end()
    })
  }

  t.end()
})

function strictEqualArray (t, a, b) {
  a.forEach((item, index) => t.strictEqual(a[index], b[index], `strictEqual at index ${index}`))
  t.equal(a.length, b.length, 'same length')
}
