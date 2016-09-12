/*!
 * Matcha - Date-based timer for Node.js
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Primary Export
 */

module.exports = Timer;

/**
 * Timer (constructor)
 *
 * Constructs a timer that will return `Date` based
 * elapsed calculation.
 *
 * @api public
 */

function Timer () {
  this._start = null;
  this._elapsed = null;
}

/**
 * .elapsed
 *
 * Return the time elapsed since start.
 *
 * @returns Number ms elapsed since start
 */

Object.defineProperty(Timer.prototype, 'elapsed',
  { get: function () {
      return this._elapsed;
    }
});

/**
 * .start ()
 *
 * Mark the starting point for this timer.
 *
 * @api public
 */

Timer.prototype.start = function () {
  this._start = new Date().getTime();
  return this;
};

/**
 * .stop ()
 *
 * Mark the end of this timer by storing the elapsed.
 *
 * @api public
 */

Timer.prototype.stop = function () {
  this._elapsed = new Date().getTime() - this._start;
  return this;
};
