var fs = require('fs');
var utils = require('./utils');
var express = require('express')
var lame = require('lame');
var audio = require('osx-audio');
var debug = require('debug')('webcast');

var Webcast = function(options) {
  if (!(this instanceof Webcast)) {
    return new Webcast(options);
  }

  this.options = options;
  this.lameOptions = {
    // input
    channels: 2,        // 2 channels (left and right)
    bitDepth: 16,       // 16-bit samples
    sampleRate: 44100,  // 44,100 Hz sample rate

    // output
    bitRate: options.bitrate,
    outSampleRate: options.samplerate,
    mode: (options.mono ? lame.MONO : lame.STEREO) // STEREO (default), JOINTSTEREO, DUALCHANNEL or MONO
  };

  // we need to get the address of the local interface
  this.ip = utils.getLocalIp(options.iface);
  
  // create the Encoder instance
  this.input = null;
  this.encoder = new lame.Encoder(this.lameOptions);
  this.encoder.on('data', this.sendChunk.bind(this));

  // listeners
  this.listeners = [];

  // set up an express app
  this.app = express()

  var count = 0;

  var self = this;
  this.app.get('/' + options.url, function (req, res) {
    res.set({
      'Content-Type': 'audio/mpeg3',
      'Transfer-Encoding': 'chunked'
    });

    if (!self.input) {
      debug("no input exists yet, creating");
      self.input = new audio.Input();
      self.input.pipe(self.encoder);
    }

    self.addListener(res);

    var onEnd = function() {
      self.removeListener(res);
    }

    res.on('close', onEnd);
    res.on('finish', onEnd);
  });

  this.server = this.app.listen(options.port);

  console.log("streaming at http://" + this.ip + ":" + options.port + "/" + options.url);

  return this;
};

Webcast.prototype.addListener = function(res) {
  debug("adding listener");
  this.listeners.push(res);
};

Webcast.prototype.removeListener = function(res) {
  var idx = this.listeners.indexOf(res);
  this.listeners.splice(idx, 1);
  debug("removed listener. " + this.listeners.length + " are left.");
};

Webcast.prototype.sendChunk = function(chunk) {
  var self = this;
  self.listeners.forEach(function(listener) {
    listener.write(chunk);
  });
};

module.exports = Webcast;
