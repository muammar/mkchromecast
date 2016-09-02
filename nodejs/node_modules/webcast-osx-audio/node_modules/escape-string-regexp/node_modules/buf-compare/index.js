'use strict';
module.exports = function (a, b) {
	if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
		throw new TypeError('Arguments must be Buffers');
	}

	if (a === b) {
		return 0;
	}

	if (typeof Buffer.compare === 'function') {
		return Buffer.compare(a, b);
	}

	var x = a.length;
	var y = b.length;
	var len = Math.min(x, y);

	for (var i = 0; i < len; i++) {
		if (a[i] !== b[i]) {
			break;
		}
	}

	if (i !== len) {
		x = a[i];
		y = b[i];
	}

	return x < y ? -1 : y < x ? 1 : 0;
};
