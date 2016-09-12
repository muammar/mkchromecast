/*!
 * Matcha - Interface Manager
 * Copyright(c) 2011-2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal Dependancies
 */

var interfaces = require('./interfaces');

/*!
 * Primary Exports
 */

module.exports = Interface;

/**
 * Interface (constructor)
 *
 * The Interface manager handles mounting
 * and unmounting of exposed interface functions
 * to the `global` or other mountpoint for a root
 * suite run.
 *
 * @param {Suite} root suite
 * @param {Object} options
 * @api public
 */

function Interface (suite, opts) {
  opts = opts || {};
  this.suite = suite;
  this.style = opts.style || 'bdd';
  this.mountpoint = opts.mountpoint || global;
  mountApi.call(this);
}

/**
 * .mount (point, function)
 *
 * Mount a function to a given point on the
 * current interface mount object (such as global).
 *
 * @param {String} mount point
 * @param {Function} callback function
 * @api public
 */

Interface.prototype.mount = function (point, fn) {
  this.mountpoint[point] = fn;
};

/**
 * .unmount (point)
 *
 * Unmount a given point on the current interface
 * mount object (such as global).
 *
 * @param {String} mount point
 * @api public
 */

Interface.prototype.unmount = function (point) {
  delete this.mountpoint[point];
};

/*!
 * mountApi ()
 *
 * Load the selected interface style and initialize
 * it for use with this interface.
 *
 * @api private
 */

function mountApi () {
  var style = this.style;
  if ('function' === typeof style) {
    style(this);
  } else {
    var fn = interfaces[style];
    if (!fn) throw new Error('Unable to load interface \'' + style + '\'.');
    fn(this);
  }
}
