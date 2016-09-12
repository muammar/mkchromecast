var test = require('tape')
var fmt = require('../').transform

var cr = new RegExp(/\n/g)
var crlf = '\r\n'

var collapse = [
  {
    program: [
      'var x = 1',
      '',
      '',
      'var z = 2',
      ''
    ].join('\n'),

    expected: [
      'var x = 1',
      '',
      'var z = 2',
      ''
    ].join('\n'),

    msg: 'two empty lines should collapse to one'
  },
  {
    program: [
      'var x = 1',
      '', '', '', '', '',
      '', '', '', '', '',
      'var z = 2', ''
    ].join('\n'),

    expected: [
      'var x = 1',
      '',
      'var z = 2', ''
    ].join('\n'),

    msg: 'ten empty lines should collapse to one'
  },
  {
    program: [
      'var foo = function () {',
      '',
      '  bar()',
      '}',
      ''
    ].join('\n'),

    expected: [
      'var foo = function () {',
      '  bar()',
      '}',
      ''
    ].join('\n'),

    msg: 'Remove padding newlines after curly braces'
  },
  {
    program: [
      'var x = 123; /* Useful comment ',
      'that spans two lines */',
      ''
    ].join('\n'),

    expected: [
      'var x = 123 /* Useful comment ',
      'that spans two lines */',
      ''
    ].join('\n'),

    msg: 'Remove semicolon from multiline comment'
  }
]

test('multiline collapse', function (t) {
  t.plan(collapse.length)
  collapse.forEach(function (obj) {
    t.equal(fmt(obj.program), obj.expected, obj.msg)
  })
})

test('multiline collapse CRLF', function (t) {
  t.plan(collapse.length)
  collapse.forEach(function (obj) {
    obj.program = obj.program.replace(cr, crlf)
    obj.expected = obj.expected.replace(cr, crlf)
    t.equal(fmt(obj.program), obj.expected, obj.msg)
  })
})

var noops = [
  {
    program: [
      'var x = 1',
      '',
      'var z = 2',
      ''
    ].join('\n'),

    msg: 'single empty line should be unmodified'
  },
  {
    program: [
      'function getRequests (cb) {',
      '  nets({',
      "    url: binUrl + '/api/v1/bins/' + bin.name + '/requests',",
      '    json: true,',
      '    headers: headers',
      '  }, function (err, resp, body) {',
      '    cb(err, resp, body)',
      '  })',
      '}',
      ''
    ].join('\n'),

    msg: "Don't mess with function tabbing"

  },
  {
    program: [
      'var obj = {',
      "  'standard': {",
      "    'ignore': ['test.js', '**test/failing/**']",
      '  }',
      '}',
      ''
    ].join('\n'),

    msg: 'allow single line object arrays'
  },
  {
    program: [
      '/*global localStorage*/',
      ';(function () { // IIFE to ensure no global leakage!',
      '}())',
      ''
    ].join('\n'),

    msg: 'IIFEs are not messed with'
  },
  {
    program: [
      "console.log('meh')",
      ';(function a () {',
      "  console.log('hiya')",
      '}())',
      ''
    ].join('\n'),

    msg: 'IIFEs are not messed with'
  }
]

test('multiline noop', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    t.equal(fmt(obj.program), obj.program, obj.msg)
  })
})

test('multiline noop CRLF', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    obj.program = obj.program.replace(cr, crlf)
    t.equal(fmt(obj.program), obj.program, obj.msg)
  })
})

var semicolons = [
  {
    program: [
      'var x = 2',
      '[1, 2, 3].map(function () {})',
      '',
      'var y = 8',
      '(function () {',
      '  bar()',
      '}())',
      ''
    ].join('\n'),

    expected: [
      'var x = 2',
      ';[1, 2, 3].map(function () {})',
      '',
      'var y = 8',
      ';(function () {',
      '  bar()',
      '}())',
      ''
    ].join('\n'),

    msg: 'Add semicolon before `[` and `(` if they are the first things on the line'
  },
  {
    program: [
      "console.log('meh');",
      '(function a() {',
      "console.log('hiya');",
      '}());',
      ''
    ].join('\n'),

    expected: [
      "console.log('meh')",
      ';(function a () {',
      "  console.log('hiya')",
      '}())',
      ''
    ].join('\n'),

    msg: 'IIFEs are not messed with'
  }
]

test('multiline semicolons', function (t) {
  t.plan(semicolons.length)
  semicolons.forEach(function (obj) {
    t.equal(fmt(obj.program), obj.expected, obj.msg)
  })
})
