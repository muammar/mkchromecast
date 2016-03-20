'use strict';

var fs = require('fs');
var chalk = require('chalk');
var parseArgs = require('minimist');

// Number.isInteger() polyfill ::
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isInteger
if (!Number.isInteger) {
  Number.isInteger = function isInteger (nVal) {
    return typeof nVal === "number" && isFinite(nVal) && nVal > -9007199254740992 && nVal < 9007199254740992 && Math.floor(nVal) === nVal;
  };
}

var cli = function(options) {
  this.options = {
    alias: {
      port: 'p',
      bitrate: 'b',
      mono: 'm',
      samplerate: 's',
      url: 'u',
      iface: 'i',
      version: 'v',
      help: 'h'
    },
    default: {
      port: 3000,
      bitrate: 192,
      samplerate: 44100,
      url: 'stream.mp3'
    },
    'boolean': ['version', 'help', 'mono'],
    'string': ['url'],
    'integer': ['port', 'bitrate', 'samplerate']
  };

  this.errors = [];
  this.message = null;

  this.helpMessage = [
    chalk.bold.blue("Usage: webcast-audio [options]"),
    "",
    "Options:",
    "   -p, --port        The port that the streaming server will listen on.  [3000]",
    "   -b, --bitrate     The bitrate for the mp3 encoded stream.  [192]",
    "   -m, --mono        The stream defaults to stereo. Set to mono with this flag.",
    "   -s, --samplerate  The sample rate for the mp3 encoded stream.  [44100]",
    "   -u, --url         The relative URL that the stream will be hosted at.  [stream.mp3]",
    "   -i, --iface       The public interface that should be reported. Selects the first interface by default.",
    "   --version         print version and exit"
  ];

  return this;
};

cli.prototype.parse = function(argv, next) {
  var options = parseArgs(argv, this.options);

  if (options.version) {
    var pkg = require('../package.json');
    this.message = "version " + pkg.version;
  }
  else if (options.help) {
    this.message = this.helpMessage.join('\n');
  }
  else {
    /*
     * Options are processed in a significant order; we only save the last error
     * message, so we'll want to make sure the most significant are last
     */

    // ensure that parameter-expecting options have parameters
    this.options['string'].forEach(function(i) {
       if(typeof options[i] !== 'undefined') {
         if (typeof options[i] !== 'string' || options[i].length < 1) {
           this.errors.push(new Error(i + " expects a value."));
         }
       }
    }.bind(this));

    // ensure that number-expecting options have parameters
    this.options['integer'].forEach(function(i) {
      if(typeof options[i] !== 'undefined') {
        if (!Number.isInteger(options[i])) {
          this.errors.push(new Error(i + " expects an integer value."));
        }
      }
    }.bind(this));
  }
  
  this.parsedOptions = options;
  
  if (typeof next === 'function') {
    // we return the array of errors if there are any, otherwise null
    next(this.errors.length > 0 ? this.errors : null, this.message, options);
  }

  return this;
};


module.exports = cli;
