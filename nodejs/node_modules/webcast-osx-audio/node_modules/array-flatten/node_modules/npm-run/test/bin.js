"use strict"

var test = require('tape')
var bl = require('bl')
var fs = require('fs')

var path = require('path')
var spawn = require('child_process').spawn

var npmRun = require('../')

var level0 = path.join(__dirname, 'fixtures', 'level0')
var level1 = path.join(level0, 'node_modules', 'level1')
var level2 = path.join(level1, 'node_modules', 'level2')

var level = [level0, level1, level2]

var pkg = require('../package.json')
var npmRunBin = path.resolve(__dirname, '..', pkg.bin[pkg.name])

test('bin ok', function(t) {
  t.ok(npmRunBin)
  t.ok(fs.existsSync(npmRunBin), 'bin exists: ' + npmRunBin)
  t.end()
})

test('passing dashed args', function(t) {
  var child = spawn(
    npmRunBin,
    'level1 here -are --some --arguments'.split(' '),
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.equal(data.toString().trim(), 'level1')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), 'here -are --some --arguments')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
    t.end()
  })
})

test('--version', function(t) {
  var child = spawn(
    npmRunBin,
    '--version'.split(' '),
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.equal(data.toString().trim(), pkg.version)
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), '')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
    t.end()
  })
})


test('bin --version', function(t) {
  var child = spawn(
    npmRunBin,
    'level1 --version'.split(' '),
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.equal(data.toString().trim(), 'level1')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), '--version')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
    t.end()
  })
})

test('--help', function(t) {
  var child = spawn(
    npmRunBin,
    '--help'.split(' '),
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.ok(data.toString().trim().indexOf('Usage:') !== -1, 'contains usage')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), '')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.equal(errCode, 0)
    t.end()
  })
})

test('bad command', function(t) {
  var child = spawn(
    npmRunBin,
    ['command-does-not-exist'],
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.ok(data.toString().trim().indexOf('not found:') !== -1, 'contains not found message')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), '')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.notEqual(errCode, 0)
    t.end()
  })
})

test('no args', function(t) {
  var child = spawn(
    npmRunBin,
    [],
    {cwd: level[0]}
  )
  var stdout = bl(function(err, data) {
    t.ok(data.toString().trim().indexOf('Usage:') !== -1, 'contains usage')
  })
  var stderr = bl(function(err, data) {
    t.equal(data.toString().trim(), '')
  })
  child.stdout.pipe(stdout)
  child.stderr.pipe(stderr)
  child.once('error', function(error) {
    t.fail(error)
  })
  child.on('close', function(errCode) {
    t.notEqual(errCode, 0)
    t.end()
  })
})
