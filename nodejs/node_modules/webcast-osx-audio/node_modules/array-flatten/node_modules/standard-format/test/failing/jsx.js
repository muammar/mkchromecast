var test = require('tape')
var fmt = require('../../').transform

var noops = [
  {
    program: [
      'export class Foo extends React.Component {',
      '  render() {',
      '    return (',
      '      <div></div>',
      '    )',
      '  }',
      '}',
      ''
    ].join('\n'),
    msg: 'Preserve indendation on JSX blocks',
    issues: ['https://github.com/maxogden/standard-format/issues/99']
  },
  {
    program: [
      'export class Foo extends React.Component {',
      '  render() {',
      '    return (',
      '      <div>',
      '        <span',
      '          foo={bar}',
      '          bar={baz} />',
      '      </div>',
      '    )',
      '  }',
      '}',
      ''
    ].join('\n'),
    msg: 'Preserve indendation on JSX blocks with parameters',
    issues: ['https://github.com/maxogden/standard-format/issues/99']
  }
]

test('JSX noops', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    var fmtd = fmt(obj.program)
    t.equal(fmtd, obj.program, obj.msg)
    console.log('issues:\n' + obj.issues.join('\n'))
  })
})
