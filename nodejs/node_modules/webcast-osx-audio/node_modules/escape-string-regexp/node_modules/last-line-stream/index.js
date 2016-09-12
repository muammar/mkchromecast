'use strict';
var through2 = require('through2');
var StringDecoder = require('string_decoder').StringDecoder;
var createTracker = require('./tracker');

module.exports = function (pipeDestination) {
	var decoder = new StringDecoder();
	var tracker = createTracker();

	var stream = through2(function (chunk, enc, cb) {
		tracker.update(decoder.write(chunk));
		cb(null, chunk);
	});

	Object.defineProperty(stream, 'lastLine', {
		get: tracker.lastLine
	});

	if (pipeDestination) {
		stream.pipe(pipeDestination);
	}

	return stream;
};
