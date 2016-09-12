'use strict';
var escapeStringRegexp = require('escape-string-regexp');
var reCache = {};

function makeRe(pattern, shouldNegate) {
	var cacheKey = pattern + shouldNegate;

	if (reCache[cacheKey]) {
		return reCache[cacheKey];
	}

	var negated = false;

	if (pattern[0] === '!') {
		negated = true;
		pattern = pattern.slice(1);
	}

	pattern = escapeStringRegexp(pattern).replace(/\\\*/g, '.*');

	if (negated && shouldNegate) {
		pattern = '(?!' + pattern + ')';
	}

	var re = new RegExp('^' + pattern + '$', 'i');

	re.negated = negated;

	reCache[cacheKey] = re;

	return re;
}

module.exports = function (inputs, patterns) {
	if (!(Array.isArray(inputs) && Array.isArray(patterns))) {
		throw new TypeError('Expected two arrays, got ' + typeof inputs + ' ' + typeof patterns);
	}

	if (patterns.length === 0) {
		return inputs;
	}

	var firstNegated = patterns[0][0] === '!';

	patterns = patterns.map(function (x) {
		return makeRe(x, false);
	});

	var ret = [];

	for (var i = 0; i < inputs.length; i++) {
		// if first pattern is negated we include
		// everything to match user expectation
		var matches = firstNegated;

		for (var j = 0; j < patterns.length; j++) {
			if (patterns[j].test(inputs[i])) {
				matches = !patterns[j].negated;
			}
		}

		if (matches) {
			ret.push(inputs[i]);
		}
	}

	return ret;
};

module.exports.isMatch = function (input, pattern) {
	return makeRe(pattern, true).test(input);
};
