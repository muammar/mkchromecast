
/**
 * Module dependencies.
 */

var assert = require('assert');
var binding = require('./bindings');
var inherits = require('util').inherits;
var Transform = require('readable-stream/transform');
var debug = require('debug')('lame:decoder');

/**
 * Module exports.
 */

module.exports = Decoder;

/**
 * Some constants.
 */

var MPG123_OK = binding.MPG123_OK;
var MPG123_DONE = binding.MPG123_DONE;
var MPG123_NEW_ID3 = binding.MPG123_NEW_ID3;
var MPG123_NEED_MORE = binding.MPG123_NEED_MORE;
var MPG123_NEW_FORMAT = binding.MPG123_NEW_FORMAT;

/**
 * One-time calls...
 */

binding.mpg123_init();
process.once('exit', binding.mpg123_exit);

/**
 * The recommended size of the "output" buffer when calling mpg123_read().
 */

var safe_buffer = binding.mpg123_safe_buffer();

/**
 * `Decoder` Stream class.
 *  Accepts an MP3 file and spits out raw PCM data.
 */

function Decoder (opts) {
  if (!(this instanceof Decoder)) {
    return new Decoder(opts);
  }
  Transform.call(this, opts);
  var ret;

  ret = binding.mpg123_new(opts ? opts.decoder : null);
  if (Buffer.isBuffer(ret)) {
    this.mh = ret;
  } else {
    throw new Error('mpg123_new() failed: ' + ret);
  }

  ret = binding.mpg123_open_feed(this.mh);
  if (MPG123_OK != ret) {
    throw new Error('mpg123_open_feed() failed: ' + ret);
  }
  debug('created new Decoder instance');
}
inherits(Decoder, Transform);

/**
 * Calls `mpg123_feed()` with the given "chunk", and then calls `mpg123_read()`
 * until MPG123_NEED_MORE is returned.
 *
 * @param {Buffer} chunk The Buffer instance of PCM audio data to process
 * @param {String} encoding ignore...
 * @param {Function} done callback function when done processing
 * @api private
 */

Decoder.prototype._transform = function (chunk, encoding, done) {
  debug('_transform(): (%d bytes)', chunk.length);
  var out, mh, self;
  self = this;
  mh = this.mh;

  binding.mpg123_feed(mh, chunk, chunk.length, afterFeed);

  function afterFeed (ret) {
    // XXX: a hack to ensure that "chunk" doesn't get GC'd until
    // after feed() is done. We could do this in C++-land to be "clean", but
    // doing this saves sizeof(Persistent<Object>) from the req struct.
    // It's also probably overkill...
    chunk = chunk;

    debug('mpg123_feed() = %d', ret);
    if (MPG123_OK != ret) {
      return done(new Error('mpg123_feed() failed: ' + ret));
    }
    read();
  }

  function read () {
    out = new Buffer(safe_buffer);
    binding.mpg123_read(mh, out, out.length, afterRead);
    // XXX: the `afterRead` function below holds the reference to the "out"
    // buffer while being filled by `mpg123_read()` on the thread pool.
  }

  function afterRead (ret, bytes, meta) {
    debug('mpg123_read() = %d (bytes=%d) (meta=%d)', ret, bytes, meta);
    if (meta & MPG123_NEW_ID3) {
      debug('MPG123_NEW_ID3');
      binding.mpg123_id3(mh, function (ret2, id3) {
        if (ret2 == MPG123_OK) {
          self.emit('id3v' + (id3.tag ? 1 : 2), id3);
          handleRead(ret, bytes);
        } else {
          // error getting ID3 tag info (probably shouldn't happen)...
          done(new Error('mpg123_id3() failed: ' + ret2));
        }
      });
    } else {
      handleRead(ret, bytes);
    }
  }

  function handleRead (ret, bytes) {
    if (bytes > 0) {
      // got decoded data
      assert(out.length >= bytes);
      if (out.length != bytes) {
        debug('slicing output buffer from %d to %d', out.length, bytes);
        out = out.slice(0, bytes);
      }

      self.push(out);
    }
    if (ret == MPG123_DONE) {
      debug('done');
      return done();
    }
    if (ret == MPG123_NEED_MORE) {
      debug('needs more!');
      return done();
    }
    if (ret == MPG123_NEW_FORMAT) {
      var format = binding.mpg123_getformat(mh);
      debug('new format: %j', format);
      self.emit('format', format);
      return read();
    }
    if (MPG123_OK != ret) {
      return done(new Error('mpg123_read() failed: ' + ret));
    }
    read();
  }
};
