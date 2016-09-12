# `time-require` @ [![Jaguard OSS 100%](http://img.shields.io/badge/Jaguard_OSS-100%-red.svg)](http://oss.jaguard.com) [![Built with gulp.js](http://img.shields.io/badge/built%20with-gulp.js-red.svg)](http://gulpjs.com)

> Displays the execution time for Node.js modules loading by hooking and tracing all `require()` calls.
This module was inspired by [@sindresorhus](https://twitter.com/sindresorhus)'s [time-grunt](https://github.com/sindresorhus/time-grunt).

## Project status
- NPM version: [![NPM version](https://badge.fury.io/js/time-require.svg)](https://www.npmjs.org/package/time-require)
- NPM downloads: [![NPM downloads](http://img.shields.io/npm/dm/time-require.svg)](https://www.npmjs.org/package/time-require)
- GitHub release: [![GitHub Release](http://img.shields.io/github/release/jaguard/time-require.svg)](https://www.npmjs.org/package/time-require)
- Travis-CI build: [![Build Status](http://img.shields.io/travis/jaguard/time-require.svg)](http://travis-ci.org/jaguard/time-require)
- Drone.io build: [![Build Status](https://drone.io/github.com/jaguard/time-require/status.png)](https://github.com/jaguard/time-require)
- Dependencies: [![Dependencies status](https://david-dm.org/jaguard/time-require/status.svg?theme=shields.io)](https://david-dm.org/jaguard/time-require#info=dependencies)
- Dev Dependencies: [![Dev Dependencies status](https://david-dm.org/jaguard/time-require/dev-status.svg?theme=shields.io)](https://david-dm.org/jaguard/time-require#info=devDependencies)

Default usage (non-verbose) showing required modules in loaded order, above 1% treshold
![default](doc/time_require_default.png)

Verbose (all) & sorted usage showing all required modules in sorted order
![verbose-sorted](doc/time_require_verbose_sorted.png)

## Install

Install with [npm](https://npmjs.org/package/time-require)

```
npm install --save time-require
```

## Usage

1. Embeded usage, generally as first `require()` call in your main module.
```js
require("time-require");
```
2. External usage with `--require` preload supported by [Liftoff](https://github.com/tkellen/node-liftoff) driven CLI modules like [gulp.js](http://gulpjs.com/) or [Grunt-Next](https://github.com/gruntjs/grunt-next)
```
gulp --require time-require --sorted
```
3. If you're using [gulp.js](http://gulpjs.com/), use instead [gulpt](https://github.com/jaguard/gulpt), a `gulp` CLI wrapper that automatically preload `time-require`.
```
npm install -g gulpt
gulpt build --sorted
```

## Display layout

Modules loading that take less than `1%` of the total time are hidden to reduce clutter.
To show **all** the modules use the `--verbose` (or `--V`) flag on the running CLI.
To **sort** the modules according to the loading time (longest on top) use the `--sorted` (or `--s`) flag on the running CLI.

## Documentation

Detailed API documentation can be found in ['doc'](doc/api.md) folder.

## Development

Detailed development documentation can be found in ['doc'](doc/dev.md) folder.

## License

[MIT](https://github.com/jaguard/time-require/raw/master/LICENSE) &copy; [Jaguard OSS](http://oss.jaguard.com)

## Changelog

- v0.1.2 (2014.04.20)
	* README.md: add NPM downloads and GitHub release, add `gulpt` usage, remove BitBucket hosting/refs
	* package.json: update dependencies
	* .npmignore: remove all development-related files from NPM (clone the repo instead)
- v0.1.1 (2014.04.10)
	* gulpfile.js: add `notifyError` for stream error notification, add `seqTask` for sequential task control, fix `project.js` config replacing `lib/` with `src/`
	* README.md: detail project hosting [@BitBucket](https://bitbucket.org/jaguard/time-require) & mirror [@GitHub](https://github.com/jaguard/time-require).
	* LICENSE.md renamed to LICENSE to keep it as a simple text file
	* package.json: set the [GitHub](https://github.com/jaguard/time-require) mirror as repository, add `run-sequence` for task order control, add `gulp-notify` for notification support
- v0.1.0 (2014.04.10)
	+ Added `.travis.yml` file for travis-ci.org build support
	+ Published `time-require` module to [npm](https://www.npmjs.org/package/time-require)
	* Include screenshoots as absolute links
- v0.0.1 (2014.03.10)
	+ Initial release