#!/usr/bin/env node

var parents = require('parents');
var fs = require('fs');
var path = require('path');
var resolve = require('resolve');

var paths = parents(process.cwd());
var parts = process.env.PATH.split(path.delimiter);
var prefix = [];
var postfix = [ path.join(__dirname, '../node_modules/.bin') ];
var existsSync = fs.existsSync || path.existsSync;

for (var i = 0; i < paths.length; i++) {
    var x = path.join(paths[i], 'node_modules/.bin');
    if (existsSync(x)) prefix.push(x);
}
process.env.PATH = prefix.concat(parts).concat(postfix).join(path.delimiter);

var minimist = require('minimist');
var spawn = require('child_process').spawn;

var argv = minimist(process.argv.slice(2), {
    boolean: [ 'c', 'h', 'q', 'json' ],
    alias: { c: 'color', color: 'colors', h: 'help', q: 'quiet' }
});
var vargv = minimist(process.argv.slice(2));

var args = argv._.slice();
if (args.length === 0 || argv.h || argv.help) {
    fs.createReadStream(path.join(__dirname, 'usage.txt')).pipe(process.stdout);
    return;
}

var coverifyPath = require.resolve('coverify');
try { coverifyPath = resolve.sync('coverify', { basedir: process.cwd() }) }
catch (e) {}

args.unshift('-t', coverifyPath, '--bare', '--node', '--no-bundle-external');

var browserifyExecutable = process.platform === 'win32' ? 'browserify.cmd' : 'browserify';
var browserify = spawn(browserifyExecutable, args);
browserify.stderr.pipe(process.stderr);
browserify.on('exit', onexit('browserify'));

var node = spawn(process.execPath, []);
node.stderr.pipe(process.stderr);
node.on('exit', onexit('node'));

var cargs = [];
if (argv.json) cargs.push('--json');
if (argv.quiet) cargs.push('--quiet');
if (vargv.color === undefined && process.stdout.isTTY) {
    cargs.push('--color');
}

var coverifyExecutable = process.platform === 'win32' ? 'coverify.cmd' : 'coverify';
var coverify = spawn(coverifyExecutable, cargs);
coverify.on('exit', onexit('coverify'));

browserify.stdout.pipe(node.stdin);
node.stdout.pipe(coverify.stdin);

if (argv.json) {
    coverify.stderr.pipe(process.stdout);
    coverify.stdout.pipe(process.stderr);
}
else {
    coverify.stderr.pipe(process.stderr);
    coverify.stdout.pipe(process.stdout);
}

function onexit (name) {
    return function (code) {
        if (code === 0) return;
        console.error('non-zero exit code in `' + name + '` command');
        process.exit(1);
    };
}
