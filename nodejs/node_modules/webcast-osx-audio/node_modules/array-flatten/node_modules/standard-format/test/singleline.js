var test = require('tape')
var fmt = require('../').transform

var noops = [
  {
    str: 'if (!opts) opts = {}\n',
    msg: 'Noop on single line conditional assignment'
  },

  {
    str: 'var g = { name: f, data: fs.readFileSync(f).toString() }\n',
    msg: 'Noop on single line object assignment'
  },
  {
    str: "{foo: 'bar'}\n",
    msg: 'Dont add padding to object braces'
  },
  {
    str: "var x = ['test.js', '**test/failing/**']\n",
    msg: 'Noop on singleline arrays'
  },
  {
    str: 'function x () {}\n',
    msg: 'Noop on named functions correctly spaced'
  },
  {
    str: 'window.wrapFunctionsUntil(1)\n',
    msg: 'Noop non-functions with function in the name'
  },
  {
    str: "import * as lib from 'lib'\n",
    msg: 'Noop ES2015 import'
  },
  {
    str: 'function* blarg (foo) {yield foo}\n',
    msg: 'Noop ES2015 generator'
  },
  {
    str: 'console.log(1 === 2 ? 3 : 4)\n',
    msg: 'Noop infix'
  },
  {
    str: 'test[0]\ntest\n',
    msg: 'allow newline after member accessor',
    issues: ['https://github.com/maxogden/standard-format/pull/93']
  },
  {
    str: 'test(test[0])\n',
    msg: "don't force newline on mid-expression member accessor",
    issues: ['https://github.com/maxogden/standard-format/pull/93']
  },
  {
    str: '// good comment\n',
    msg: 'Expect good comments to be unchanged'
  }
]

test('singleline noop expressions', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    t.equal(fmt(obj.str), obj.str, obj.msg)
  })
})

var transforms = [
  {
    str: 'var x = function() {}\n',
    expect: 'var x = function () {}\n',
    msg: 'Anonymous function spacing between keyword and arguments'
  },
  {
    str: 'var x = function (y){}\n',
    expect: 'var x = function (y) {}\n',
    msg: 'Anonymous function spacing between arguments and opening brace'
  },
  {
    str: 'function xx() {}\n',
    expect: 'function xx () {}\n',
    msg: 'Named function spacing between keyword and arguments'
  },
  {
    str: 'function xx (y){}\n',
    expect: 'function xx (y) {}\n',
    msg: 'Named function spacing between arguments and opening brace'
  },
  {
    str: 'var     hi =    1\n',
    expect: 'var hi = 1\n',
    msg: 'Squash spaces around variable value'
  },
  {
    str: 'var hi           = 1\n',
    expect: 'var hi = 1\n',
    msg: 'Space after variable name'
  },
  {
    str: 'var hi\n hi =    1\n',
    expect: 'var hi\nhi = 1\n',
    msg: 'Squash spaces around assignment operator'
  },
  {
    str: 'function foo (x,y,z) {}\n',
    expect: 'function foo (x, y, z) {}\n',
    msg: 'Space after commas in function parameters'
  },
  {
    str: 'var array = [1,2,3]\n',
    expect: 'var array = [1, 2, 3]\n',
    msg: 'Space after commas in array'
  },
  {
    str: 'var x = 1;\n',
    expect: 'var x = 1\n',
    msg: 'Remove semicolons'
  },
  {
    str: 'var x = {key:123}\n',
    expect: 'var x = {key: 123}\n',
    msg: 'Space after colon (key-spacing)'
  },
  {
    str: 'var x = {key : 123}\n',
    expect: 'var x = {key: 123}\n',
    msg: 'No Space before colon (key-spacing)'
  },
  {
    str: 'if(true){}\n',
    expect: 'if (true) {}\n',
    msg: 'Space after if'
  },
  {
    str: 'if ( true ) {}\n',
    expect: 'if (true) {}\n',
    msg: 'Remove spaces inside conditional'
  },
  {
    str: 'var condition = ( x === y )\n',
    expect: 'var condition = (x === y)\n',
    msg: 'Remove spaces inside expression parentheses'
  },
  {
    str: 'function doStuff ( x, y ) {}\n',
    expect: 'function doStuff (x, y) {}\n',
    msg: 'Remove spaces inside parameter list parentheses'
  },
  {
    str: 'var x = 123; // Useful comment\n',
    expect: 'var x = 123 // Useful comment\n',
    msg: 'Remove unneeded trailing semicolons that are followed by a comment'
  },
  {
    str: 'var x = 123; /* Useful comment */\n',
    expect: 'var x = 123 /* Useful comment */\n',
    msg: 'Remove unneeded trailing semicolons that are followed by a multiline comment'
  },
  {
    str: 'console.log(1===2?3:4)\n',
    expect: 'console.log(1 === 2 ? 3 : 4)\n',
    msg: 'infix'
  },
  {
    str: 'const { message, rollup, line, col, type } = origMessage\n',
    expect: 'const { message, rollup, line, col, type } = origMessage\n',
    msg: 'No space before comma in keys in destructuring assignment'
  },
  {
    str: '//bad comment\n',
    expect: '// bad comment\n',
    msg: 'Expect space or tab after // in comment'
  }
]

test('singleline transforms', function (t) {
  t.plan(transforms.length)
  transforms.forEach(function (obj) {
    t.equal(fmt(obj.str), obj.expect, obj.msg)
  })
})

var cr = new RegExp(/\n/g)
var crlf = '\r\n'

test('singleline transforms CRLF', function (t) {
  t.plan(transforms.length)
  transforms.forEach(function (obj) {
    obj.str = obj.str.replace(cr, crlf)
    obj.expect = obj.expect.replace(cr, crlf)
    t.equal(fmt(obj.str), obj.expect, obj.msg)
  })
})
