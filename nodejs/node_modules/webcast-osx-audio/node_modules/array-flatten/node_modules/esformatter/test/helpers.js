"use strict";

//
// helpers used on the specs
//


var _fs = require('fs');
var _path = require('path');
var stripJsonComments = require('strip-json-comments');


// ---


exports.CACHE = {};
exports.COMPARE_FOLDER = _path.join(__dirname, 'compare');


// ---


exports.readIn = function(id) {
  return exports.readFile(_path.join(exports.COMPARE_FOLDER, id + '-in.js'));
};


exports.readOut = function(id) {
  return exports.readFile(_path.join(exports.COMPARE_FOLDER, id + '-out.js'));
};


exports.readConfig = function(id) {
  var filePath = _path.join(exports.COMPARE_FOLDER, id + '-config.json');
  return JSON.parse(stripJsonComments(exports.readFile(filePath) + '\n'));
};


exports.readFile = function(path) {
  // we cache the results to avoid redundant I/O
  if (!(path in exports.CACHE)) {
    exports.CACHE[path] = exports.lineFeed(_fs.readFileSync(path).toString());
  }
  return exports.CACHE[path];
};


exports.purge = function(dir) {
  if (!exports.SHOULD_PURGE) return;
  _fs.readdirSync(dir).forEach(function(relPath) {
    var path = _path.join(dir, relPath);
    if (_fs.statSync(path).isDirectory()) {
      exports.purge(path);
    } else {
      _fs.unlinkSync(path);
    }
  });
  _fs.rmdirSync(dir);
};


exports.mkdir = function(dir) {
  if (!_fs.existsSync(dir)) {
    _fs.mkdirSync(dir);
  }
};

exports.lineFeed = function(text) {
  return text.replace(/\r\n?|[\n\u2028\u2029]/g, "\n");
};
