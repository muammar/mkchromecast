#!/usr/bin/env node

var pkg = require('../package.json')
var exec = require('child_process').exec
var path = require('path')
var npmExec = require('../')
var npmWhich = require('npm-which')

var program = require('minimist')(process.argv)

if (program._.length == 2) {
  if (program.version) {
    console.log(pkg.version)
    process.exit()
  }
  if (program.help) {
    displayHelp(program._[1])
    process.exit()
  } else {
    displayHelp(program._[1])
    process.exit(1)
  }
}

try {
  var command = npmWhich.sync(process.argv[2], {cwd: process.cwd()})
} catch (err) {
  console.log(err.message)
  process.exit(1)
}

npmExec.spawn(process.argv[2], process.argv.slice(3), {stdio: 'inherit'})
.on('error', function(err) {
  console.error(err.stack)
})
.on('close', function(code) {
  process.exit(code)
})

function displayHelp(name) {
  console.log([
    'Usage: '+name+' command [...args]',
    'Options:',
    '  --version  Display version and exit.',
    '  --help     Display this help.',
    ''
  ].join('\n'))

}
