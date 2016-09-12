'use strict';
module.exports = function (ms) {
	if (typeof ms !== 'number') {
		throw new TypeError('Expected a number');
	}

	return {
		days: Math.floor(ms / 86400000),
		hours: Math.floor(ms / 3600000 % 24),
		minutes: Math.floor(ms / 60000 % 60),
		seconds: Math.floor(ms / 1000 % 60),
		milliseconds: Math.floor(ms % 1000)
	};
};
