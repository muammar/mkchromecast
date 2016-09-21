
/**
 * Module dependencies.
 */

var assert = require('assert');
var binding = require('./bindings');
var inherits = require('util').inherits;
var Transform = require('readable-stream/transform');
var debug = require('debug')('lame:encoder');

/**
 * Module exports.
 */

module.exports = Encoder;

/**
 * Constants.
 */

var LAME_OKAY = binding.LAME_OKAY;
var LAME_BADBITRATE = binding.LAME_BADBITRATE;
var LAME_BADSAMPFREQ = binding.LAME_BADSAMPFREQ;
var LAME_INTERNALERROR = binding.LAME_INTERNALERROR;

var PCM_TYPE_SHORT_INT = binding.PCM_TYPE_SHORT_INT;
var PCM_TYPE_FLOAT = binding.PCM_TYPE_FLOAT;
var PCM_TYPE_DOUBLE = binding.PCM_TYPE_DOUBLE;

/**
 * Messages for error codes returned from the lame C encoding functions.
 */

var ERRORS = {
  '-1': 'output buffer too small',
  '-2': 'malloc() problems',
  '-3': 'lame_init_params() not called',
  '-4': 'psycho acoustic problems'
};

/**
 * Map of libmp3lame functions to node-lame property names.
 */

var PROPS = {
  'brate': 'bitRate',
  'num_channels': 'channels',
  'bWriteVbrTag': 'writeVbrTag',
  'in_samplerate': 'sampleRate',
  'out_samplerate': 'outSampleRate'
};

/**
 * The valid bit depths that lame supports encoding in.
 */

var INT_BITS = binding.sizeof_int * 8;
var SHORT_BITS = binding.sizeof_short * 8;
var FLOAT_BITS = binding.sizeof_float * 8;
var DOUBLE_BITS = binding.sizeof_double * 8;

/**
 * The `Encoder` class is a Transform stream class.
 * Write raw PCM data, out comes an MP3 file.
 *
 * @param {Object} opts PCM stream format info and stream options
 * @api public
 */

function Encoder (opts) {
  if (!(this instanceof Encoder)) {
    return new Encoder(opts);
  }
  Transform.call(this, opts);

  // lame malloc()s the "gfp" buffer
  this.gfp = binding.lame_init();

  // set default options
  if (!opts) opts = {};
  if (null == opts.channels) opts.channels = 2;
  if (null == opts.bitDepth) opts.bitDepth = 16;
  if (null == opts.sampleRate) opts.sampleRate = 44100;
  if (null == opts.signed) opts.signed = opts.bitDepth != 8;

  if (opts.float && opts.bitDepth == DOUBLE_BITS) {
    this.inputType = PCM_TYPE_DOUBLE;
  } else if (opts.float && opts.bitDepth == FLOAT_BITS) {
    this.inputType = PCM_TYPE_FLOAT;
  } else if (!opts.float && opts.bitDepth == SHORT_BITS) {
    this.inputType = PCM_TYPE_SHORT_INT;
  } else {
    throw new Error('unsupported PCM format!');
  }

  // copy over opts to the encoder instance
  Object.keys(opts).forEach(function(key){
    if (key[0] != '_' && Encoder.prototype.hasOwnProperty(key)) {
      debug('setting opt %j', key);
      this[key] = opts[key];
    }
  }, this);
}
inherits(Encoder, Transform);

/**
 * Default PCM format: signed 16-bit little endian integer samples.
 */

Encoder.prototype.bitDepth = 16;

/**
 * Called one time at the beginning of the first `_transform()` call.
 *
 * @api private
 */

Encoder.prototype._init = function () {
  debug('_init()');

  var r = binding.lame_init_params(this.gfp);
  if (LAME_OKAY !== r) {
    throw new Error('error initializing params: ' + r);
  }

  // constant: number of 'bytes per sample'
  this.blockAlign = this.bitDepth / 8 * this.channels;
};

/**
 * Calls `lame_encode_buffer_interleaved()` on the given "chunk.
 *
 * @api private
 */

Encoder.prototype._transform = function (chunk, encoding, done) {
  debug('_transform (%d bytes)', chunk.length);

  var self = this;
  if (!this._initCalled) {
    try { this._init(); } catch (e) { return done(e); }
    this._initCalled = true;
  }

  // first handle any _remainder
  if (this._remainder) {
    debug('concating remainder');
    chunk = Buffer.concat([ this._remainder, chunk ]);
    this._remainder = null;
  }
  // set any necessary _remainder (we can only send whole samples at a time)
  var remainder = chunk.length % this.blockAlign;
  if (remainder > 0) {
    debug('setting remainder of %d bytes', remainder);
    var slice = chunk.length - remainder;
    this._remainder = chunk.slice(slice);
    chunk = chunk.slice(0, slice);
  }
  assert.equal(chunk.length % this.blockAlign, 0);

  var num_samples = chunk.length / this.blockAlign;
    // TODO: Use better calculation logic from lame.h here
  var estimated_size = 1.25 * num_samples + 7200;
  var output = new Buffer(estimated_size);
  debug('encoding %d byte chunk with %d byte output buffer (%d samples)', chunk.length, output.length, num_samples);


  binding.lame_encode_buffer(
    this.gfp,
    chunk,
    this.inputType,
    this.channels,
    num_samples,
    output,
    0,
    output.length,
    cb
  );

  function cb (bytesWritten) {
    debug('after lame_encode_buffer() (rtn: %d)', bytesWritten);
    if (bytesWritten < 0) {
      var err = new Error(ERRORS[bytesWritten]);
      err.code = bytesWritten;
      done(err);
    } else if (bytesWritten > 0) {
      output = output.slice(0, bytesWritten);
      debug('writing %d MP3 bytes', output.length);
      self.push(output);
      done();
    } else { // bytesWritten == 0
      done();
    }
  }
};

/**
 * Calls `lame_encode_flush_nogap()` on the thread pool.
 */

Encoder.prototype._flush = function (done) {
  debug('_flush');

  var self = this;
  var estimated_size = 7200; // value specified in lame.h
  var output = new Buffer(estimated_size);

  if (!this._initCalled) {
    try { this._init(); } catch (e) { return done(e); }
    this._initCalled = true;
  }

  binding.lame_encode_flush_nogap(
    this.gfp,
    output,
    0,
    output.length,
    cb
  );

  function cb (bytesWritten) {
    debug('after lame_encode_flush_nogap() (rtn: %d)', bytesWritten);

    binding.lame_close(self.gfp);
    self.gfp = null;

    if (bytesWritten < 0) {
      var err = new Error(ERRORS[bytesWritten]);
      err.code = bytesWritten;
      done(err);
    } else if (bytesWritten > 0) {
      output = output.slice(0, bytesWritten);
      self.push(output);
      done();
    } else { // bytesWritten == 0
      done();
    }
  }
};

/**
 * Define the getter/setters for the lame encoder settings.
 */

Object.keys(binding).forEach(function (key) {
  if (!/^lame_[gs]et/.test(key)) return;
  var name = key.substring(9);
  var prop = PROPS[name] || toCamelCase(name);
  debug('processing prop %j as %j', key, prop);
  var getter = 'g' == key[5];
  /*
  console.error({
    key: key,
    name: name,
    prop: prop,
    getter: getter
  });
  */
  var desc = Object.getOwnPropertyDescriptor(Encoder.prototype, prop);
  if (!desc) desc = { enumerable: true, configurable: true };
  if (getter) {
    desc.get = function () {
      debug('%s()', key);
      return binding[key](this.gfp);
    };
  } else {
    desc.set = function (v) {
      debug('%s(%j)', key, v);
      var r = binding[key](this.gfp, v);
      if (LAME_OKAY !== r) {
        throw new Error('error setting prop "' + prop + '": ' + r);
      }
      return r;
    };
  }
  Object.defineProperty(Encoder.prototype, prop, desc);
});

/**
 * The lame encoder only supports "signed" data types.
 */

Object.defineProperty(Encoder.prototype, 'signed', {
  enumerable: true,
  configurable: true,
  get: function () { return true; },
  set: function (v) { if (!v) throw new Error('"signed" must be `true`'); }
});


/**
 * Converts a string_with_underscores to camelCase.
 *
 * @param {String} name The name to convert.
 * @return {String} The camel case'd name.
 * @api private
 */

function toCamelCase (name) {
  return name.replace(/(\_[a-zA-Z])/g, function ($1) {
    return $1.toUpperCase().replace('_', '');
  });
}
