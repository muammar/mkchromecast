
/**
 * The `Decoder` accepts an MP3 file and outputs raw PCM data.
 */

exports.Decoder = require('./lib/decoder');

/**
 * The `Encoder` accepts raw PCM data and outputs an MP3 file.
 */

exports.Encoder = require('./lib/encoder');

/*
 * Channel Modes
 */
exports.STEREO = 0;
exports.JOINTSTEREO = 1;
exports.DUALCHANNEL = 2;
exports.MONO = 3;
