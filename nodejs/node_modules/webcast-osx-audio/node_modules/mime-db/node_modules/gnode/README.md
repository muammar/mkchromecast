gnode
=====
### Run node with ES6 Generators, today!
[![Build Status](https://travis-ci.org/TooTallNate/gnode.svg?branch=master)](https://travis-ci.org/TooTallNate/gnode)

`gnode` is a very light wrapper around your `node` executable that ensures
[ES6 Generator][generators] support, even on versions of node that do not
support ES6 Generators natively.

You use it exactly like the regular `node` executable, except that you _do not_
need to pass the `--harmony-generators` flag. That is where the magic happens.

With `gnode` you can use [`co`][co] or [`suspend`][suspend], or any other
Generator-based flow control based module, today!


How does this magic work?
-------------------------

#### node &lt; 0.11.3

When V8 provides no native ES6 generators support, then `gnode` invokes a node
instance with a patched `require.extensions['.js']` function, which transparently
transpiles your ES6 code with Generators into ES5-compatible code. We can thank
[`facebook/regenerator`][regenerator] for making this possible.

Under the hood, this command:

``` bash
$ gnode foo.js all the args
```

Turns into something like this:

``` bash
$ GNODE_ENTRY_POINT=foo.js node fallback.js all the args
```

#### node &gt;= 0.11.3

When V8 supports ES6 generators natively, then `gnode` invokes a node instance
with the `--harmony-generators` flag passed in transparently, so that the native
generators are used, and no transpiling takes place. Everything else _just works_
as you would expect it to.

Under the hood, this command:

``` bash
$ gnode foo.js all the args
```

Turns into something like this:

``` bash
$ node --harmony-generators foo.js all the args
```


Installation
------------

Install the `gnode` executable via npm:

``` bash
$ npm install -g gnode
```


CLI Examples
------------

The `gnode` executable uses whatever version of node is installed in your `PATH`:

Here's our example `t.js` file:

``` js
var co = require('co');

function sleep (ms) {
  return function (fn) {
    setTimeout(fn, ms);
  };
}

co(function* () {
  for (var i = 0; i < 5; i++) {
    console.log(i);
    yield sleep(1000);
  }
})();
```

This script with an ES6 Generator in it can be run using any version of node
by using `gnode`:

``` bash
☮ ~ (master) ∴ n 0.8.26

☮ ~ (master) ∴ gnode -v
v0.8.26

☮ ~ (master) ∴ gnode t.js
0
1
2
3
4

☮ ~ (master) ∴ n 0.10.21

☮ ~ (master) ∴ gnode -v
v0.10.21

☮ ~ (master) ∴ gnode t.js
0
1
2
3
4

☮ ~ (master) ∴ n 0.11.8

☮ ~ (master) ∴ gnode -v
v0.11.8

☮ ~ (master) ∴ gnode t.js
0
1
2
3
4
```


Programmatic API
----------------

You can also just `require('gnode')` in a script _without any generators_, and
then `require()` any other .js file that has generators after that.

``` js
require('gnode');
var gen = require('./someGenerator');
// etc…
```

[co]: https://github.com/visionmedia/co
[suspend]: https://github.com/jmar777/suspend
[generators]: http://wiki.ecmascript.org/doku.php?id=harmony:generators
[regenerator]: https://github.com/facebook/regenerator
