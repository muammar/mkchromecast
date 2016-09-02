'use strict';
var isObservable = require('is-observable');
var symbolObservable = require('symbol-observable');

module.exports = function (val) {
	if (!isObservable(val)) {
		throw new TypeError('Expected an observable');
	}

	var ret = [];

	return val[symbolObservable]()
		.forEach(function (x) {
			ret.push(x);
		})
		.then(function () {
			return ret;
		});
};
