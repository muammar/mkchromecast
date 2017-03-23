var audio = require('./audio');
var inherits = require('util').inherits;
var Readable = require('stream').Readable;
var debug = require('debug')('osxaudio:input');

var MAX_BUFFERS = 16;

var input = null;
var readers = [];

function Input(opts) {
  if (!(this instanceof Input)) {
    return new Input(opts);
  }
  Readable.call(this, opts);

  if (!opts) opts = {};

  this._audioBuffers = [];
  this.reading = false;

  debug("instantiated.");

  return this;
}
inherits(Input, Readable);

Input.prototype._audioCallback = function(size, message) {
  if(this.reading) {
    this.push(message);
    this.read(0);
  }
};

Input.prototype._read = function(n) {
  if (!this.reading) {
    debug('_read() opening input');
    this.openInput();
  }
};

Input.prototype.openInput = function() {
  if(!input) {
    input = new audio.input();
  }

  if (!input.isOpen()) {
    input.openInput();
  }

  input.on('message', this._audioCallback.bind(this));

  // add ourselves to the readers index
  readers.push(this);
  this.reading = true;
};

Input.prototype.closeInput = function() {
  // remove ourself from the readers index
  var index = readers.indexOf(this);
  if (index > -1) {
    readers.splice(index, 1);
  }

  // if we were the last reader, kill the input
  if (readers.length === 0 && input.isOpen()) {
    debug("closeInput() last reader closed, shutting down");
    input.closeInput();
  }

  input.removeListener('message', this._audioCallback.bind(this));

  // close the stream
  this.push(null);
  this.reading = false;
};

module.exports = Input;
