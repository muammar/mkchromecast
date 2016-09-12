# Matcha

> A caffeine driven, simple approach to benchmarking.

Matcha allow you to design experiments that will measure the performance of your code. It is recommended that each
bench focus on a specific point of impact in your application.

![Matcha Report](http://f.cl.ly/items/3X0a1m0S250t2A0W3n1r/matcha-benchmark.png)

## Installation

Matcha is available on npm.

      $ npm install matcha

## Writing Async Benchmarks

Though suites/benches are executed serially, the benches themselves can be asyncronous. Furthermore, suites ran with
the matcha command line runner have a number of globals to simplify bench definitions. Take the following code, for example:

```js
suite('Make Tea', function () {
  var tea = new CupOfTea('green');

  bench('boil water', function(next) {
    tea.boil('85℃', function (err, h20) {
      // perfect temperature!
      next();
    });
  });

  // add tea, pour, ...  

  bench('sip tea', function() {
    tea.sip('mmmm');
  });
});
```
#### Async vs. Sync

Since boiling water takes time, a `next` function was provided to each iteration in our bench to be called when the
async function completes. Since the consumption of tea provides instant gratification, no `next` needed to be provided, even though
we still wish to measure it.

#### Setup/Teardown

Arbitray functions may be specified for setup or teardown for each suite by using the `before` and `after` keywords.
These function may be sync or async.

```js
suite('DB', function() {
  before(function(next) {
    db.connect('localhost:9090', next);
  });

  bench(function(next) {
    // ...
  });

  after(function() {
    db.close();
  });
});
```

#### Setting Options

As not all code is equal, we need a way to change the running conditions for our benches. Options can currently be changed for
any given suite, and will be retained for any nested suites or benches of that suite. 

To set an option:

```js
suite('Make Tea', function () {
  set('iterations', 10000);
  set('type', 'static');
  // ...
```
##### Defaults

Here are all available options and the default values:

```js
set('iterations', 100);     // the number of times to run a given bench
set('type', 'adaptive');    // or 'static' (see below)
set('mintime', 500);        // when adaptive, the minimum time in ms a bench should run
set('delay', 100);          // time in ms between each bench
```

##### Static vs Adaptive

There are two modes for running your benches: 'static' and 'adaptive'. Static mode will run exactly the set number of iterations.
Adaptive will run the set iterations, then if a minimal time elapsed has not passed, will run more another set of iterations, then
check again (and repeat) until the requirement has been satisfied.

## Running Benchmarks

Running of your benchmarks is provided through `./bin/matcha`. The recommended approach is to add a devDependancy in your
`package.json` and then add a line to a `Makefile` or build tool. The `matcha` bin will accept a list of files to load or will 
look in the current working directory for a folder named `benchmark` and load all files.

      $ matcha suite1.js suite2.js

## Options

        -h, --help               view matcha usage information
        -v, --version            view matcha version
        -R, --reporter [clean]   specify the reporter to use
        -I, --interface [bdd]    specify the interface to expect
        --interfaces             display available interfaces
        --reporters              display available reporters

#### -I, --interface <name>
The --interface option lets you specify the interface to use, defaulting to "bdd".

#### -R, --reporter <name>
The --reporter option allows you to specify the reporter that will be used, defaulting to "clean".

### Interfaces
Matcha "interface" system allows developers to choose their style of DSL. Shipping with bdd, and     exports flavoured interfaces.
#### bdd

```js
suite('suite name', function(){
    set('iterations', 10);
    bench('bench name', function(done){
        some_fn(done);
  });
});
```

#### exports

```js
exports['suite name'] = {
    options: {
      iterations: 10
    },
    bench: {
        'bench name': function (doen) {
            some_fn(done);
        }
    }
};
```

### Reporters
Matcha reporters adjust to the terminal window.
#### clean
Good-looking default reporter with colors on the terminal screen.
#### plain
Similar to _clean_ reporter but without colors and other ANSI sequences.
#### csv
Completely different, create csv formated rows for later processing.

## Contributing

Interested in contributing? Fork to get started. Contact [@logicalparadox](http://github.com/logicalparadox) 
if you are interested in being regular contributor.

##### Contibutors 

* Jake Luer ([Github: @logicalparadox](http://github.com/logicalparadox)) ([Twitter: @jakeluer](http://twitter.com/jakeluer)) ([Website](http://alogicalparadox.com))
* Patrick Steele-Idem ([Github: @patrick-steele-idem](http://github.com/patrick-steele-idem)) ([Twitter: @psteeleidem](http://twitter.com/psteeleidem))

## Shoutouts

* [mocha](http://visionmedia.github.com/mocha) inspired the suite/bench definition language. 

## License

(The MIT License)

Copyright (c) 2011-2012 Jake Luer <jake@alogicalparadox.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
