var path = require('path')
var fs = require('fs')
var fmt = require('../').transform
var standard = require('standard')
var inspect = require('util').inspect

function testFile (filePath, depth) {
  // Reads a file, formats its contents then lints it with standard
  // Test fails if there are linting errors or warnings
  // Inspect depth is optional
  var basename = path.basename(filePath)
  function test (t) {
    fs.readFile(filePath, {encoding: 'utf8'}, function (err, data) {
      t.error(err, 'read ' + basename + ' file without error ')

      var formatted

      try {
        formatted = fmt(data)
      } catch (e) {
        t.error(e, 'format ' + basename + ' without error')
      }

      standard.lintText(formatted, function (err, result) {
        t.error(err, 'linting ' + basename + ' should be error free')
        t.equal(result.errorCount, 0, basename + ' error free after formatting')
        t.equal(result.warningCount, 0, basename + ' warning free after formatting')
        if (result.errorCount || result.warningCount !== 0) {
          // If there is an issue, print the details
          console.log(inspect(result, {depth: depth || null}))
        }
        t.end()
      })
    })
  }
  return test
}

module.exports = testFile
