;(function() {
  // this tests begin of program
  bar()
}())

// should add if missing
var x = 2
;[1, 2, 3].map(function() {})
// comment
;[7, 8].forEach(doStuff)

var y = 8
;(function() {
  bar()
}())

// should keep if it already contains
;[4, 5].forEach(doStuff)

;(function() {
  init()
})

// should not add if not needed
if (true) {
  [1, 2, 3].map(function() {})
}

callFunctionLotsOfArgs(
  foo,
  bar,
  baz,
  [bizzle]
)

callFunctionLotsOfArgs(
  foo,
  bar,
  baz,
  // test if comment will affect logic
  [bizzle]
)

// issue #6
var jsx = <div onSomething={(x) => y(x)}><foo /></div>;

// test ES6 support
import * as lib from 'lib'
const noop = async () => undefined

// issue #4
var obj = {}
var z = {
  ...obj,
  test: 1
}
