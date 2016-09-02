var test = require('tape')
var fmt = require('../../').transform

var noops = [
  {
    program: [
      'var cool =',
      '  a +',
      '  b +',
      '  c',
      ''
    ].join('\n'),
    msg: 'Allow indendation following a newline after assignment operator',
    issues: ['https://github.com/maxogden/standard-format/issues/101']
  }
]

test('multiline noop', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    var fmtd = fmt(obj.program)
    t.equal(fmtd, obj.program, obj.msg)
    console.log('issues:\n' + obj.issues.join('\n'))
  })
})

var transforms = [
  {
    program: [
      'function x()',
      '{',
      '  var i=0;',
      '  do {',
      '    i++',
      '  } while(i<10)',
      '  console.log(i);',
      '}'
    ].join('\n'),
    expected: [
      'function x () {',
      '  var i = 0',
      '  do {',
      '    i++',
      '  } while (i < 10)',
      '  console.log(i)',
      '}',
      ''
    ].join('\n'),
    msg: 'Indendation following a do-while loop',
    issues: [
      'https://github.com/maxogden/standard-format/pull/87',
      'https://github.com/maxogden/standard-format/issues/86'
    ]
  }
]

test('Failing Multiline Transforms', function (t) {
  t.plan(transforms.length)
  transforms.forEach(function (obj) {
    t.equal(fmt(obj.program), obj.expected, obj.msg)
    console.log('issues:\n' + obj.issues.join('\n'))
  })
})
