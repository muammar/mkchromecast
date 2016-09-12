var common = require('./common');

module.exports = EventEmitter;

function EventEmitter () {
  // nothing to see here
}

/**
 * ### .on (event, callback)
 *
 * Bind a `callback` function to all emits of `event`.
 *
 * ```js
 * drop.on('foo', callback);
 * ```
 *
 * @param {String} event
 * @param {Function} callback
 * @alias addListener
 * @name on
 * @api public
 */

EventEmitter.prototype.on =
EventEmitter.prototype.addListener = function () {
  var map = this._events || (this._events = {})
    , ev = arguments[0]
    , fn = arguments[1];
  if (!map[ev]) map[ev] = fn;
  else if ('function' === typeof map[ev]) map[ev] = [ map[ev], fn ];
  else map[ev].push(fn);
  return this;
};

/**
 * @import ./common.js#exports.many
 * @api public
 */

EventEmitter.prototype.many = common.many;

/**
 * @import ./common.js#exports.once
 * @api public
 */

EventEmitter.prototype.once = common.once;

/**
 * ### .off ([event], [callback])
 *
 * Unbind `callback` function from `event`. If no function
 * is provided will unbind all callbacks from `event`. If
 * no event is provided, event store will be purged.
 *
 * ```js
 * emitter.off('event', callback);
 * ```
 *
 * @param {String} event _optional_
 * @param {Function} callback _optional_
 * @alias removeListener
 * @alias removeAllListeners
 * @name off
 * @api public
 */

EventEmitter.prototype.off =
EventEmitter.prototype.removeListener =
EventEmitter.prototype.removeAllListeners = function (ev, fn) {
  if (!this._events || arguments.length == 0) {
    this._events = {};
    return this;
  }

  if (!fn) {
    this._events[ev] = null;
    return this;
  }

  var fns = this._events[ev];

  if (!fns) return this;
  else if ('function' === typeof fns && fns == fn) this._events[ev] = null;
  else {
    for (var i = 0; i < fns.length; i++)
      if (fns[i] == fn) fns.splice(i, 1);
    if (fns.length === 0) this._events[ev] = null;
    else if (fns.length === 1) this._events[ev] = fns[0];
  }

  return this;
}

/**
 * ### .emit (event[, args], [...])
 *
 * Trigger `event`, passing any arguments to callback functions.
 *
 * ```js
 * emitter.emit('event', arg, ...);
 * ```
 *
 * @param {String} event name
 * @param {Mixed} multiple parameters to pass to callback functions
 * @name emit
 * @api public
 */

EventEmitter.prototype.emit = function () {
  if (!this._events) return false;

  var ev = arguments[0]
    , fns = this._events[ev];

  if (!fns) return false;

  if ('function' == typeof fns) {
    if (arguments.length == 1) fns.call(this);
    else if (arguments.length == 2) fns.call(this, arguments[1]);
    else if (arguments.length == 3) fns.call(this, arguments[1], arguments[2]);
    else {
      var l = arguments.length
        , a = Array(l - 1);
      for (var i = 1; i < l; i++) a[i - 1] = arguments[i];
      fns.apply(this, a);
    }
  } else {
    var a;
    for (var i = 0, l = fns.length; i < l; i++) {
      if (arguments.length === 1) fns[i].call(this);
      else if (arguments.length === 2) fns[i].call(this, arguments[1]);
      else if (arguments.length === 3) fns[i].call(this, arguments[1], arguments[2]);
      else {
        if (!a) {
          var l = arguments.length
          a = Array(l - 1);
          for (var i2 = 1; i2 < l; i2++) a[i2 - 1] = arguments[i2];
        }
        fns[i].apply(this, a);
      }
    }
  }

  return true;
};

/**
 * ### .hasListener (ev[, function])
 *
 * Determine if an event has listeners. If a function
 * is proved will determine if that function is a
 * part of the listeners.
 *
 * @param {String} event key to seach for
 * @param {Function} optional function to check
 * @returns {Boolean} found
 * @name hasListeners
 * @api public
 */

EventEmitter.prototype.hasListener = function (ev, fn) {
  if (!this._events) return false;
  var fns = this._events[ev];
  if (!fns) return false;
  return common.hasListener(fns, fn);
};

/**
 * ### .listners (ev)
 *
 * Retrieve a list of all callbacks for an
 * event.
 *
 * @param {String} event
 * @return {Array} callbacks
 * @name listeners
 * @api public
 */

EventEmitter.prototype.listeners = function (ev) {
  if (!this._events) return [];
  var fns = this._events[ev];
  if (!fns) return [];
  if ('function' === typeof fns) return [ fns ];
  else return fns;
};

/**
 * ### .bindEvent (event, target)
 *
 * A bound event will listen for events on the current emitter
 * instance and emit them on the target when they occur. This
 * functionality is compable with node event emitter.
 *
 * ```js
 * emitter.bindEvent('request', target);
 * ```
 *
 * Note that proxies will also be removed if a generic `off` call
 * is used.
 *
 * @param {String} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name bindEvent
 * @api public
 */

EventEmitter.prototype.bindEvent = common.bindEvent;

/**
 * ### .unbindEvent (event, target)
 *
 * Remove a bound event listener. Event and target
 * must be provied the same as in `bindEvent`.
 *
 * ```js
 * emitter.unbindEvent('request', target);
 * ```
 *
 * @param {String} event key to bind
 * @param {Object} target drip or node compatible event emitter
 * @name unbindEvent
 * @api public
 */

EventEmitter.prototype.unbindEvent = common.unbindEvent;

/**
 * ### .proxyEvent (event, [namespace], target)
 *
 * An event proxy will listen for events on a different
 * event emitter and emit them on the current drip instance
 * when they occur. An optional namespace will be pre-pended
 * to the event when they are emitted on the current drip
 * instance.
 *
 * For example, the following will demonstrate a
 * namspacing pattern for node.
 *
 * ```js
 * function ProxyServer (port) {
 *   Drip.call(this, { delimeter: ':' });
 *   this.server = http.createServer().listen(port);
 *   this.bindEvent('request', 'server', this.server);
 * }
 * ```
 *
 * Anytime `this.server` emits a `request` event, it will be
 * emitted on the constructed ProxyServer as `server:request`.
 * All arguments included in the original emit will also be
 * available.
 *
 * ```js
 * var proxy = new ProxyServer(8080);
 *   proxy.on('server:request', function (req, res) {
 *   // ..
 * });
 * ```
 *
 * If you decide to use the namespace option, you can namespace
 * as deep as you like using either an array or a string that
 * uses your delimeter or `:`. The following examples are valid.
 *
 * ```js
 * emitter.proxyEvent('request', 'proxy:server', server);
 * emitter.proxyEvent('request', [ 'proxy', 'server' ], server);
 * emitter.on('proxy:server:request', cb);
 * ```
 *
 * @param {String} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name proxyEvent
 * @api public
 */

EventEmitter.prototype.proxyEvent = common.proxyEvent;

/**
 * ### .unproxyEvent (event, [namespace], target)
 *
 * Remove an event proxy by removing the listening event
 * from the target. Don't forget to include a namespace
 * if it was used during `proxyEvent`.
 *
 * ```js
 * proxy.unbindEvent('request', proxy.server);
 * proxy.unbindEvent('request', 'request', proxy.server);
 * ```
 *
 * @param {String} event key to proxy
 * @param {String} namespace to prepend to this emit
 * @param {Object} target event emitter
 * @name unproxyEvent
 * @api public
 */

EventEmitter.prototype.unproxyEvent = common.unproxyEvent;
