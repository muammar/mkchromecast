#!/usr/bin/env node

var fmt = require('./')
var fs = require('fs')
var stdin = require('stdin')
var argv = require('minimist')(process.argv.slice(2), {
  boolean: ['help', 'stdin', 'version', 'write'],
  alias: {
    h: 'help',
    w: 'write',
    v: 'version'
  }
})

// running `standard-format -` is equivalent to `standard-format --stdin`
if (argv._[0] === '-') {
  argv.stdin = true
  argv._.shift()
}

if (argv.help) {
  console.log(function () {
  /*
  standard-format - Auto formatter for the easier cases in standard

  Usage:
      standard-format <flags> [FILES...]

      If FILES is omitted, then all JavaScript source files (*.js) in the current
      working directory are checked, recursively.

      These paths are automatically excluded:
      node_modules/, .git/, *.min.js, bundle.js

  Flags:
      -v  --version   Show current version.
      -w  --write     Directly modify input files.
      -h, --help      Show usage information.

  Readme:  https://github.com/maxogden/standard-format

  */
  }.toString().split(/\n/).slice(2, -2).join('\n'))
  process.exit(0)
}

if (argv.version) {
  console.log(require('./package.json').version)
  process.exit(0)
}

function processFile (transformed) {
  if (argv.write && transformed.name !== 'stdin') {
    fs.writeFileSync(transformed.name, transformed.data)
  } else {
    process.stdout.write(transformed.data)
  }
}

function getFiles (done) {
  var args = argv._
  if (argv.stdin) {
    return stdin(function (file) {
      return done(null, [{ name: 'stdin', data: file }])
    })
  } else if (args.length === 0) {
    return fmt.load(done)
  } else {
    return done(null, args.map(function (file) {
      return { name: file, data: fs.readFileSync(file).toString() }
    }))
  }
}

getFiles(function (err, files) {
  if (err) return error(err)
  files.forEach(function (file) {
    try {
      file.data = fmt.transform(file.data)
      processFile(file)
    } catch (e) { error(file.name + ': ' + e) }
  })
})

function error (err) {
  console.error(err)
  process.exit(1)
}
