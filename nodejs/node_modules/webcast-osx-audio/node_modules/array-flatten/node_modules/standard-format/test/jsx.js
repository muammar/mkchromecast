var test = require('tape')
var fmt = require('../').transform

var noops = [
  {
    program: [
      'export default class Foo extends Component {',
      '  renderPartial() {',
      '    return this.props.bar.map((item) => {',
      '      return <Bar key={item.foo} data={item}/>',
      '    })',
      '  }',
      '}',
      ''
    ].join('\n'),

    msg: 'Keep indentation for multiple return statements with JSX'
  }
]

test('jsx noop', function (t) {
  t.plan(noops.length)
  noops.forEach(function (obj) {
    t.equal(fmt(obj.program), obj.program, obj.msg)
  })
})
