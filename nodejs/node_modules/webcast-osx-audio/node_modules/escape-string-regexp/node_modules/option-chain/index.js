'use strict';
var objectAssign = require('object-assign');

module.exports = function (options, fn, target) {
	var chainables = options.chainableMethods || {};
	var spread = options.spread;
	var defaults = objectAssign({}, options.defaults);

	function extend(target, getter, ctx) {
		Object.keys(chainables).forEach(function (key) {
			Object.defineProperty(target, key, {
				enumerable: true,
				configurable: true,
				get: function () {
					return wrap(getter, chainables[key], ctx || this);
				}
			});
		});
	}

	function wrap(createOpts, extensionOpts, ctx) {
		function wrappedOpts() {
			return objectAssign(createOpts(), extensionOpts);
		}

		function wrappedFn() {
			var args = new Array(arguments.length);
			for (var i = 0; i < args.length; i++) {
				args[i] = arguments[i];
			}
			if (spread) {
				args.unshift(wrappedOpts());
			} else {
				args = [wrappedOpts(), args];
			}
			return fn.apply(ctx || this, args);
		}

		extend(wrappedFn, wrappedOpts, ctx);

		return wrappedFn;
	}

	function copyDefaults() {
		return objectAssign({}, defaults);
	}

	if (target) {
		extend(target, copyDefaults);
		return target;
	}

	return wrap(copyDefaults);
};
