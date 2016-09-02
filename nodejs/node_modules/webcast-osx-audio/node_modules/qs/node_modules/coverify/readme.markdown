# coverify

code coverage browserify transform

[![testling badge](https://ci.testling.com/substack/coverify.png)](https://ci.testling.com/substack/coverify)

[![build status](https://secure.travis-ci.org/substack/coverify.png)](http://travis-ci.org/substack/coverify)

# example

Suppose we have a test.js:

``` js
var test = require('tape');
var foo = require('./foo.js');

test('beep boop', function (t) {
    t.plan(1);
    
    foo(function (err, x) {
        if (err) deadCode();
        t.equal(x * 5, 555);
    });
});
```

and a foo.js:

``` js
module.exports = function (cb) {
    var i = 0;
    var iv = setInterval(function () {
        if (i++ === 10 || (false && neverFires())) {
            clearInterval(iv);
            cb(null, 111);
        }
    }, 10);
};
```

Now with [browserify](http://browserify.org) just do:

```
$ browserify -t coverify example/test.js --bare | node | coverify
TAP version 13
# beep boop
ok 1 should be equal

1..1
# tests 1
# pass  1

# ok

# /home/substack/projects/coverify/example/test.js: line 7, column 16-28

  if (err) deadCode();
           ^^^^^^^^^^^

# /home/substack/projects/coverify/example/foo.js: line 3, column 35-48

  if (i++ === 10 || (false && neverFires())) {
                              ^^^^^^^^^^^^

# coverage: 34/36 (94.4400%)

```

`browserify` compiled our `test.js` file, then `testling` ran our code in a
local headless browser (we also could have used `node`), and then `coverify`
parsed the test output for code coverage data and printed some nicely formatted
results on stderr. Hooray!

and the exit code is non-zero because the coverage wasn't 100%:

```
$ echo $?
1
```

If you want to run code coverage for browser tests, you can use the
[testling](https://npmjs.org/package/testling) command:

```
$ browserify -t coverify example/test.js | testling | coverify
```

and the output and exit codes work exactly the same, except the code is running
in a browser instead of node.

# methods

``` js
var coverify = require('coverify')
var parse = require('coverify/parse')
```

Usually you can just do `browserify -t coverify` to get code coverage but you
can also use the api directly if you want to use this code directly.

## var stream = coverify(file, opts={})

Return a transform stream for `file` that will instrument the input source file
using `console.log()`.

To use a different function from `console.log()`, pass in `opts.output`.

## var stream = parse(cb)

Return a transform stream that accepts test output as input and looks for lines
starting with `COVERAGE` and `COVERED` to generate a coverage report in
`cb(err, coverage, counts)`.

`coverage` is an object that maps filenames from the bundle files to arrays of
coverage data.

`counts` is an object mapping filenames to objects with `expr` and `total`
fields for how many expressions were covered and how many expressions were
present.

All of the non-`/^(COVERAGE|COVERED)\s/` lines are passed through from the input
to the output.

Here is some example coverage data that you can generate with `coverify --json`:

```
{
  "/home/substack/projects/coverify/example/test.js": [
    {
      "range": [
        158,
        169
      ],
      "lineNum": 7,
      "column": [
        16,
        28
      ],
      "line": "        if (err) deadCode();",
      "code": "deadCode();"
    }
  ],
  "/home/substack/projects/coverify/example/foo.js": [
    {
      "range": [
        123,
        135
      ],
      "lineNum": 3,
      "column": [
        35,
        48
      ],
      "line": "        if (i++ === 10 || (false && neverFires())) {",
      "code": "neverFires()"
    }
  ]
}
```

# usage

```
usage: coverify OPTIONS

OPTIONS are:

  --json

    Suppress normal output and print json coverage data to stdout.

  -q, --quiet

    Don't print non-coverage input back out to stdout and print coverage
    output to stdout instead of stderr.

  -c, --color

    Use color in the output. Default: true if stdout is a TTY.

  --stdout

    Always print non-coverage input back out to stdout.

  -o FILE, --output FILE

    Print coverage data to FILE. Use "@2" for stderr (the default) and
    "@1" or "-" for stdout.

```

# install

With [npm](https://npmjs.org) do:

```
npm install coverify
```

to get the browserify transform module.

When you compile your tests with browserify you can just do:

```
browserify -t coverify ...
```

You will also need the `coverify` command for parsing the test output:

```
npm install -g coverify
```

# license

MIT
