'use strict';
var fs = require('fs');
var path = require('path');
var childProcess = require('child_process');
var minimist = require('minimist');
var arrify = require('arrify');
var argv = require('the-argv');
var pathExists = require('path-exists');
var readPkgUp = require('read-pkg-up');
var writePkg = require('write-pkg');
var Promise = require('pinkie-promise');
var pify = require('pify');
var DEFAULT_TEST_SCRIPT = 'echo "Error: no test specified" && exit 1';

var PLURAL_OPTIONS = [
	'env',
	'global',
	'ignore'
];

var CONFIG_FILES = [
	'.eslintrc.js',
	'.eslintrc.yaml',
	'.eslintrc.yml',
	'.eslintrc.json',
	'.eslintrc',
	'.jshintrc',
	'.jscsrc',
	'.jscs.json',
	'.jscs.yaml'
];

function warnConfigFile(pkgCwd) {
	var files = CONFIG_FILES.filter(function (x) {
		return pathExists.sync(path.join(pkgCwd, x));
	});

	if (files.length === 0) {
		return;
	}

	console.log(files.join(' & ') + ' can probably be deleted now that you\'re using XO.');
}

module.exports = function (opts) {
	opts = opts || {};

	var ret = readPkgUp.sync({
		cwd: opts.cwd,
		normalize: false
	});
	var pkg = ret.pkg || {};
	var pkgPath = ret.path || path.resolve(opts.cwd || '', 'package.json');
	var pkgCwd = path.dirname(pkgPath);
	var s = pkg.scripts = pkg.scripts ? pkg.scripts : {};

	if (s.test && s.test !== DEFAULT_TEST_SCRIPT) {
		// don't add if it's already there
		if (!/^xo( |$)/.test(s.test)) {
			s.test = 'xo && ' + s.test;
		}
	} else {
		s.test = 'xo';
	}

	var cli = minimist(opts.args || argv());
	var unicorn = cli.unicorn;

	delete cli._;
	delete cli.unicorn;
	delete cli.init;

	PLURAL_OPTIONS.forEach(function (option) {
		if (cli[option]) {
			cli[option + 's'] = arrify(cli[option]);
			delete cli[option];
		}
	});

	if (Object.keys(cli).length) {
		pkg.xo = cli;
	} else if (pkg.xo) {
		delete pkg.xo;
	}

	writePkg.sync(pkgPath, pkg);

	var post = function () {
		warnConfigFile(pkgCwd);

		// for personal use
		if (unicorn) {
			var pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
			pkg.devDependencies.xo = '*';
			writePkg.sync(pkgPath, pkg);

			CONFIG_FILES.forEach(function (x) {
				try {
					fs.unlinkSync(path.join(pkgCwd, x));
				} catch (err) {}
			});
		}
	};

	return opts.skipInstall ? Promise.resolve(post) :
		pify(childProcess.exec, Promise)('npm install --save-dev xo', {
			cwd: pkgCwd
		}).then(post);
};
