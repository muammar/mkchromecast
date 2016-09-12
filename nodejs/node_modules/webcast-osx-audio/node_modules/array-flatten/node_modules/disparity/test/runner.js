'use strict';

var assert = require('assert');
var disparity = require('../disparity');
var cli = require('../disparity-cli');
var fs = require('fs');
var path = require('path');

function readFile(name) {
  var filePath = path.join(__dirname, name);
  return fs.readFileSync(filePath).toString();
}

function compare(diff, expected, name) {
  if (diff !== expected) {
    // not using assert because it is easier to understand what is wrong
    process.stderr.write('disparity.' + name + '() failure!\n');
    process.stderr.write('=== expected result:\n');
    process.stderr.write(expected);
    process.stderr.write('\n=== actual result:\n');
    process.stderr.write(diff);
    throw new Error('assertion error');
  }
}

// setup
// =====

var diff, expected;
var file1 = readFile('file1.js');
var file2 = readFile('file2.js');

// chars
// =====

diff = disparity.chars(file1, file2);
expected = readFile('chars.txt');
compare(diff, expected, 'chars');

// unified
// =======

diff = disparity.unified(file1, file2);
expected = readFile('unified.txt');
compare(diff, expected, 'unified');

diff = disparity.unified(file1, file2, {
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('unified_2.txt');
compare(diff, expected, 'unified_2');

// unifiedNoColor
// ==============

diff = disparity.unifiedNoColor(file1, file2, {
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('unified_no_color.txt');
compare(diff, expected, 'unified_no_color');

// custom colors
// =============

var _oldColors = disparity.colors;
// wrap blocks into custom tags
disparity.colors = {
  // chars diff
  charsRemoved: { open: '<bggreen>', close: '</bggreen>' },
  charsAdded: { open: '<bgred>', close: '</bgred>' },

  // unified diff
  removed: { open: '<red>', close: '</red>' },
  added: { open: '<green>', close: '</green>' },
  header: { open: '<yellow>', close: '</yellow>' },
  section: { open: '<magenta>', close: '</magenta>' }
};

diff = disparity.chars(file1, file2);
expected = readFile('chars.html');
compare(diff, expected, 'chars.html');

diff = disparity.unified(file1, file2, {
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('unified.html');
compare(diff, expected, 'unified.html');

disparity.colors = _oldColors;

// cli.parse
// =========

var args = cli.parse([]);
assert.ok(args.help, 'help');
assert.equal(args.errors.length, 0, 'error 1');

args = cli.parse(['--help']);
assert.ok(args.help, 'help 2');

args = cli.parse(['-h']);
assert.ok(args.help, 'help 3');

args = cli.parse(['-v']);
assert.ok(args.version, 'version');
assert.equal(args.errors.length, 0, 'error 2');

args = cli.parse(['-u']);
compare(args.errors[0], 'Error: you should provide 2 file paths, found "0".', 'error 3');
assert.equal(args.errors.length, 1, 'error 3.2');

args = cli.parse(['-u', 'foo.js', '--bar']);
assert.ok(args.unified, '-u');
assert.equal(args.paths[0], 'foo.js');
// --bar should cause an error since it's invalid
compare(args.errors[0], 'Error: you should provide 2 file paths, found "1".', 'error 4');
assert.equal(args.errors.length, 1, 'error 4.2');

args = cli.parse(['--unified', 'foo.js', 'bar.js']);
assert.ok(args.unified, '--unified');
assert.equal(args.paths[0], 'foo.js');
assert.equal(args.paths[1], 'bar.js');
assert.equal(args.errors.length, 0, 'error 5');

args = cli.parse(['-c', 'foo.js', 'bar.js']);
assert.ok(!args.unified, '!--unified');
assert.ok(args.chars, '-c');

args = cli.parse(['--chars', 'foo.js', 'bar.js']);
assert.ok(!args.unified, '!--unified');
assert.ok(args.chars, '--chars');

args = cli.parse(['--unified-no-color', 'foo.js', 'bar.js']);
assert.ok(!args.errors.length, '--unified-no-color errors');
assert.ok(args.unifiedNoColor, '--unified-no-color');

// cli.run
// =======

function FakeStream(){
  this.data = '';
  this.write = function(data) {
    this.data += data;
  };
}

var code;
var out = new FakeStream();
var err = new FakeStream();

function run(args) {
  code = null;
  out.data = '';
  err.data = '';
  return cli.run(args, out, err);
}

code = run({ help: true });
assert.ok(!code, 'exit code');
assert.ok(out.data.length > 100, 'output help');

code = run({ version: true });
assert.ok(!code, 'exit code');
assert.equal(out.data, 'disparity v' + require('../package.json').version +'\n', 'version');

code = run({ errors: ['Error: foo bar'] });
assert.ok(code, 'exit code error');
assert.equal(err.data, 'Error: foo bar\n\n');
assert.ok(out.data.search('Options:'));

code = run({
  chars: true,
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('chars_paths.txt');
assert.ok(!code, 'exit code chars');
compare(out.data, expected, 'cli chars with paths');
assert.equal(err.data, '');

code = run({
  unified: true,
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('unified_2.txt');
assert.ok(!code, 'exit code chars');
compare(out.data, expected, 'cli unified_2.txt');
assert.equal(err.data, '');

code = run({
  unifiedNoColor: true,
  paths: ['test/file1.js', 'test/file2.js']
});
expected = readFile('unified_no_color.txt');
assert.ok(!code, 'exit code chars');
compare(out.data, expected, 'no color');
assert.equal(err.data, '');
