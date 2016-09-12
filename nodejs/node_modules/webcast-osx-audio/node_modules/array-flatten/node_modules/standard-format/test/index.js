var test = require('tape')
var join = require('path').join
var testFile = require('./testFile')
var TARGET_FILE = join(__dirname, './test-files/test.js')

test('test.js formatted and linted without error', testFile(TARGET_FILE))
