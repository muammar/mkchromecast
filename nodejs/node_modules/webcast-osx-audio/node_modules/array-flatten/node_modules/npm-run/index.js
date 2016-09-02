"use strict"

var npmPath = require('npm-path')
var child_process = require('child_process')
var syncExec = require('sync-exec')
var spawnSync = require('spawn-sync')

var exec = child_process.exec

// polyfill for child_process.execSync
var execSync = child_process.execSync || function(args, path) {
  return syncExec(args, path).stdout
}

var execFile = child_process.execFile
var spawn = child_process.spawn
var fork = child_process.fork

npmExec.spawn = npmSpawn
npmExec.spawnSync = npmSpawnSync
npmExec.sync = npmExecSync

npmExec.exec = npmExec
npmExec.execSync = npmExecSync

module.exports = npmExec

function npmExec(command, options, fn) {
  var a = normalizeExecArgs(command, options)
  command = a[0]
  options = a[1]
  return exec(command, augmentOptionsSync(options), fn)
}

function npmSpawn(command, args, options, fn) {
  var a = normalizeSpawnArgs(command, args, options)
  command = a[0]
  args = a[1]
  options = a[2]
  fn = a[3]
  return spawn(command, args, augmentOptionsSync(options), fn)
}

function npmSpawnSync(command, args, options) {
  var a = normalizeSpawnArgs(command, args, options)
  command = a[0]
  args = a[1]
  options = a[2]
  return spawnSync(command, args, augmentOptionsSync(options))
}

function npmExecSync(command, options) {
  var a = normalizeExecArgs(command, options)
  command = a[0]
  options = a[1]
  return execSync(command, augmentOptionsSync(options))
}

function augmentOptions(options, fn) {
  if (arguments.length === 1) fn = options, options = null
  options = Object.create(options || {})
  options.env = options.env || process.env
  options.cwd = options.cwd || process.cwd()
  npmPath.get(options, function(err, newPath) {
    var env = Object.create(options.env)
    env[npmPath.PATH] = newPath
    options.env = env
    fn(null, options)
  })
}

function augmentOptionsSync(options) {
  var newPath = npmPath.getSync(options)
  var env = Object.create(options.env)
  env[npmPath.PATH] = newPath
  options.env = env
  return options
}

function normalizeSpawnArgs(file /*, args, options*/) {
  var args, options;

  if (Array.isArray(arguments[1])) {
    args = arguments[1].slice(0);
    options = arguments[2];
  } else if (arguments[1] !== undefined &&
             (arguments[1] === null || typeof arguments[1] !== 'object')) {
    throw new TypeError('Incorrect value of args option');
  } else {
    args = [];
    options = arguments[1];
  }

  if (options === undefined)
    options = {};
  else if (options === null || typeof options !== 'object')
    throw new TypeError('options argument must be an object');

  return [file, args, options]
}

function normalizeExecArgs(command /*, options, callback */) {
  var options, callback;

  if (typeof arguments[1] === 'function') {
    options = undefined;
    callback = arguments[1];
  } else {
    options = arguments[1];
    callback = arguments[2];
  }
  callback = callback || noopErr
  return [command, options, callback]
}

function normalizeForkArgs(modulePath /*, args, options*/) {
  var args, options;
  if (Array.isArray(arguments[1])) {
    args = arguments[1].slice(0);
    options = arguments[2];
  } else if (arguments[1] && typeof arguments[1] !== 'object') {
    throw new TypeError('Incorrect value of args option');
  } else {
    args = [];
    options = arguments[1];
  }
  return [modulePath, args, options]
}

function noopErr(err) {
  if (err) throw err
}
