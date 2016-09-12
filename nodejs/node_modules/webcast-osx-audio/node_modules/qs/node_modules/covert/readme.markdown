# covert

code coverage command

# example

Just run `covert` on some ordinary files:

```
$ covert test/*.js
TAP version 13
# defined-or
ok 1 empty arguments
ok 2 1 undefined
ok 3 2 undefined
ok 4 4 undefineds
ok 5 false[0]
ok 6 false[1]
ok 7 zero[0]
ok 8 zero[1]
ok 9 first arg
ok 10 second arg
ok 11 third arg
# (anonymous)
ok 12 should be equal

1..12
# tests 12
# pass  12

# ok

# /home/substack/projects/defined/index.js: line 3, column 18-26

  if (false) dead();
             ^^^^^^^

# /home/substack/projects/defined/index.js: line 6, column 16-18, 19-25, 26-30, 31-51

  for (var i = 0; i < 5; i++) console.log('blah');
               ^  ^^^^^  ^^^  ^^^^^^^^^^^^^^^^^^^

# /home/substack/projects/defined/index.js: line 10, column 3-24

  console.log('blah');
  ^^^^^^^^^^^^^^^^^^^^

# coverage: 76/82 (92.68 %)

non-zero exit code in `coverify` command
```

In this example, this test suite is using
[tape](https://npmjs.org/package/tape). Tests written with tape can just be run
directly using `node`, which fits very well with what this command expects.

# install

With [npm](https://npmjs.org) do:

```
npm install -g covert
```

# usage

```
usage: covert {OPTIONS} FILES

  Instrument FILES and in-module dependencies, writing coverage data to STDERR.

  OPTIONS are:

    --json

      Suppress normal output and print json coverage data to stdout.

    -q, --quiet  

      Only print coverage data, suppressing all other output.

    -c, --color

      Use color in the output. Default: true if stdout is a TTY.

```

# why

Most code coverage libraries do weird things I don't like, such as writing all
their junk to directories and files in a completely out-of-band way.

covert:

* only uses stderr and stdout, doesn't write to any files.
All of this business about `lcov` files and directories with reports in them
really weirds me out.

* bundles with `browserify --bare` and a transform instead of hijacking
`require()`. All the reporting goes through a unix pipeline on process.stdin and
process.stdout. This is still hacky, but it's the kind of hacky that you can fix
yourself when the magic breaks down. The internal pipeline is just:

```
browserify -t coverify --bare $* | node | coverify
```

* works really well with simple unix pipelines.
stdin and stdout: the wisdom of the ancients.

# license

MIT
