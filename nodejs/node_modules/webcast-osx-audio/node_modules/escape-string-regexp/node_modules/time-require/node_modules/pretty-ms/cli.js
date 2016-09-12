#!/usr/bin/env node
'use strict';
var pkg = require('./package.json');
var prettyMs = require('./index');
var input = process.argv[2];

function stdin(cb) {
	var ret = '';
	process.stdin.setEncoding('utf8');
	process.stdin.on('data', function (data) { ret += data });
	process.stdin.on('end', function () { cb(ret) }).resume();
}

function help() {
	console.log(pkg.description);
	console.log('');
	console.log('Usage');
	console.log('  $ pretty-ms <milliseconds> [--compact]');
	console.log('  $ echo <milliseconds> | pretty-ms');
	console.log('');
	console.log('Example');
	console.log('  $ pretty-ms 1337');
	console.log('  1s 337ms');
}

function init(data) {
	console.log(prettyMs(Number(data), {
		compact: process.argv.indexOf('--compact') !== -1
	}));
}

if (process.argv.indexOf('-h') !== -1 || process.argv.indexOf('--help') !== -1) {
	help();
	return;
}

if (process.argv.indexOf('-v') !== -1 || process.argv.indexOf('--version') !== -1) {
	console.log(pkg.version);
	return;
}

if (process.stdin.isTTY) {
	if (!input) {
		help();
		return;
	}

	init(input);
} else {
	stdin(init);
}
