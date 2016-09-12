/*!
 * Matcha - Suite Constructor
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * External Dependancies
 */

var EventEmitter = require('events').EventEmitter
  , util = require('util');

/*!
 * Primary Exports
 */

module.exports = Suite;

function Suite (title) {
  this.title = title || '';
  this.benches = [];
  this.suites = [];
  this.before = [];
  this.after = [];
  this.options = {
      type: 'adaptive'
    , iterations: 100
    , mintime: 500
    , delay: 100
  };
}

/**
 * Suite.create (parent, title)
 *
 * Export helper to automatically create a new
 * suite and add it to a given parent. Used
 * by interfaces.
 *
 * @param {Suite} parent
 * @param {String} title
 * @api public
 */

Suite.create = function (parent, title) {
  var suite = new Suite(title);
  parent.addSuite(suite);
  return suite;
}

/*!
 * Inherits from `EventEmitter`
 */

util.inherits(Suite, EventEmitter);

/**
 * .addSuite (suite)
 *
 * Add another instance of a suite as a child
 * of the current suite.
 *
 * @param {Suite} constructed suite
 * @name addSuite
 * @api public
 */

Suite.prototype.addSuite = function (suite) {
  suite.parent = this;
  this.suites.push(suite);
};

/**
 * .addBench (bench)
 *
 * Add a constructed bench as a child of the
 * current suite. Will use this suite's options
 * during it's run.
 *
 * @param {Bench} constructed benchmark
 * @name addBench
 * @api public
 */

Suite.prototype.addBench = function (bench) {
  bench.parent = this;
  this.benches.push(bench);
};

/**
 * .setOption (key, value)
 *
 * Set an option of this suite to a given value.
 * All immediate children benches will use these
 * options.
 *
 * @param {String} key
 * @param {Mixed} value
 * @name setOption
 * @api public
 */

Suite.prototype.setOption = function (key, value) {
  this.options[key] = value;
};

/**
 * .addBefore (fn)
 *
 * Add a function to be invoked before this suite
 * is ran. Can be async.
 *
 * @param {Function} function
 * @name addBefore
 * @api public
 */

Suite.prototype.addBefore = function (fn) {
  this.before.push(fn);
};

/**
 * .addAfter (fn)
 *
 * Add a function to be invoked after this suite
 * is ran. Can be async.
 *
 * @param {Function} function
 * @name addAfter
 * @api public
 */

Suite.prototype.addAfter = function (fn) {
  this.after.push(fn);
};
