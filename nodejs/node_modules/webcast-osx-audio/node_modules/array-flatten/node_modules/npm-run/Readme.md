# npm-run

[![Build Status](https://travis-ci.org/timoxley/npm-run.svg?branch=master)](https://travis-ci.org/timoxley/npm-run)

### Run local executables from node_modules

Makes it easy to run locally-installed package executables in a robust manner.  Any executable available to an npm lifecycle script is available to `npm-run`.


## Why

Due to npm's install algorithm `node_modules/.bin` is not guaranteed to contain your executable. `npm-run` uses the same mechanism npm uses to locate the correct executable.

## Installation

```bash
> npm install -g npm-run
```

## Usage

```bash
> npm install mocha
> npm-run mocha test/*
# uses local mocha executable
```

## API

The API of `npm-run` basically wraps `child_process` methods and executes
them with an [npm-path](https://github.com/timoxley/npm-path) augmented PATH i.e. any 

## npmRun(command[, options], callback)

Alias of npmRun.exec

## npmRun.exec(command[, options], callback)

Takes same arguments as node's [exec](https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback).

```js
npmRun.exec('mocha --debug-brk --sort', {cwd: __dirname + '/tests'}, function(err, stdout, stderr) {
  // err Error or null if there was no error
  // stdout Buffer|String
  // stderr Buffer|String
})
```

## npmRun.sync(command[, options])

Alias of npmRun.execSync

## npmRun.execSync(command[, options])

Takes same arguments as node's [execSync](https://nodejs.org/api/child_process.html#child_process_child_process_execsync_command_options).

```js
var stdout = npmRun.execSync(
  'mocha --debug-brk --sort'
  {cwd: __dirname + '/tests'}
)
stdout // command output as Buffer|String
```

## npmRun.spawnSync(command[, args][, options])

Takes same arguments as node's [spawnSync](https://nodejs.org/api/child_process.html#child_process_child_process_spawnsync_command_args_options).

```js
var child = npmRun.spawnSync(
  'mocha',
  '--debug-brk --sort'.split(' '),
  {cwd: __dirname + '/tests'}
)
child.stdout // stdout Buffer|String
child.stderr // stderr Buffer|String
child.status // exit code
```

### See Also

* [timoxley/npm-which](https://github.com/timoxley/npm-which)
* [timoxley/npm-path](https://github.com/timoxley/npm-path)
* [grncdr/npm-exec](https://github.com/grncdr/npm-exec)

## License

MIT
