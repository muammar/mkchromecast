var audio = require('bindings')('audio');
var Stream = require('stream');
var debug = require('debug')('osxaudio:input');

// Audio input inherits from EventEmitter
var EventEmitter = require('events').EventEmitter;
audio.input.prototype.__proto__ = EventEmitter.prototype;

module.exports = audio;

