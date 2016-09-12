/*!
 * Matcha - Benchmark Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * External Dependancies
 */

var EventEmitter = require('events').EventEmitter
  , util = require('util')
  , Timer = require('./timer');

/*!
 * Internal Dependancies
 */

var series = require('./utils').series;

/*!
 * proxy (from, to, event)
 *
 * Proxy an event from one object to another.
 *
 * @param {EventEmitter} from
 * @param {EventEmitter} to
 * @param {String} event
 * @api private
 */

function proxy (from, to, ev) {
  from.on(ev, function () {
    var args = Array.prototype.slice.call(arguments)
      , event = [ ev ].concat(args);
    to.emit.apply(to, event);
  });
};

/*!
 * Primary Exports
 */

module.exports = Runner;

function Runner (suite) {
  this.suite = suite;
}

/*!
 * Inherits from `EventEmitter`
 */

util.inherits(Runner, EventEmitter);

/**
 * .run (callback)
 *
 * Start the entire run sequence for a given
 * suite. The callback will be called upon
 * completion. Will call in the following order:
 *
 * - before hooks
 * - benches
 * - suites
 * - after hooks
 *
 * @param {Function} callback
 * @name run
 * @api public
 */

Runner.prototype.run = function (cb) {
  var self = this;

  var stats = this.stats = { suites: 0, benches: 0 };


  function iterator (fn, next) {
    fn(next);
  }

  this.on('bench start', function() {
    stats.benches++;
  });

  function done () {
    stats.elapsed = self.timer.stop().elapsed;
    self.emit('end', stats);
    cb()
  }

  this.timer = new Timer().start();
  this.emit('start');

  series([
      this.runBefore.bind(this)
    , this.runBenches.bind(this)
    , this.runSuites.bind(this)
    , this.runAfter.bind(this)
  ], iterator, done);
};

/**
 * .runBenches (callback)
 *
 * Will invoke the `.run` method of each
 * bench in this suite serially, taking into
 * account the delay option of the suite.
 *
 * @param {Function} callback
 * @name runBenches
 * @api public
 */

Runner.prototype.runBenches = function (cb) {
  var self = this
    , suite = this.suite
    , stats = []
    , delay = suite.options.delay;

  series(suite.benches, delay, function (bench, next) {
    self.emit('bench start', bench);
    bench.run(function (res) {
      stats.push(res);
      self.emit('bench end', res);
      next();
    });
  }, function () {
    self.emit('suite results', stats);
    cb();
  });
};

/**
 * .runSuites (callback)
 *
 * Will invoke the `.run` method of each
 * nested suite serially, taking into account
 * this suites delay between each suite.
 *
 * @param {Function} callback
 * @name runSuites
 * @api public
 */

Runner.prototype.runSuites = function (done) {
  var self = this
    , suite = this.suite
    , delay = suite.options.delay;

  series(suite.suites, delay, function (suite, next) {
    var runner = new Runner(suite);
    proxy(runner, self, 'suite start');
    proxy(runner, self, 'suite end');
    proxy(runner, self, 'suite results');
    proxy(runner, self, 'bench start');
    proxy(runner, self, 'bench end');
    self.emit('suite start', suite);
    runner.run(function () {
      self.stats.suites++;
      self.emit('suite end', suite);
      next();
    });
  }, done);
};

/**
 * .runBefore (callback)
 *
 * Will invoke each before hook of the current
 * suite serially. Will take into account async
 * and sync functions.
 *
 * @param {Function} callback
 * @name runBefore
 * @api public
 */

Runner.prototype.runBefore = function (done) {
  runHooks.call(this, this.suite.before, done);
};

/**
 * .runAfter (callback)
 *
 * Will invoke each after hook of the current
 * suite serially. Will take into account async
 * and sync functions.
 *
 * @param {Function} callback
 * @name runAfter
 * @api public
 */

Runner.prototype.runAfter = function (done) {
  runHooks.call(this, this.suite.after, done);
};

/*!
 * runHooks (hooks, callback)
 *
 * Private function to handle the actual serial
 * running of hooks for before and after this
 * suite.
 *
 * @param {Array} hook functions
 * @param {Functon} callback
 * @api private
 */

function runHooks (hooks, done) {
  series(hooks, function (fn, next) {
    if (fn.length == 0) {
      fn();
      next();
    } else {
      fn(next);
    }
  }, done);
}
