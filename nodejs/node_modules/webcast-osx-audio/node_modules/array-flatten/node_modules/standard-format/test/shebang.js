var test = require('tape')
var fmt = require('../').transform

test('deal with shebang line', function (t) {
  t.plan(2)

  var program = "#!/usr/bin/env node\nconsole.log('badaboom')\n"
  var formatted

  var msg = 'Expect formatter to not explode with shebang'
  t.ok(formatted = fmt(program), msg)

  msg = 'Expect program to be still have shebang'
  t.equal(formatted, program, msg)
})
