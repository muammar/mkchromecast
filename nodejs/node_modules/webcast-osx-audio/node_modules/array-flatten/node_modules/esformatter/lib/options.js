"use strict";

var stripJsonComments = require('strip-json-comments');
var fs = require('fs');
var path = require('path');

var _ws = require('rocambole-whitespace');
var _br = require('rocambole-linebreak');
var indent = require('./indent');
var plugins = require('./plugins');

var deepMixIn = require('mout/object/deepMixIn');
var merge = require('mout/object/merge');
var get = require('mout/object/get');
var isObject = require('mout/lang/isObject');
var userHome = require('user-home');
var isEmpty = require('mout/lang/isEmpty');

// ---

var _curOpts;

// ---

exports.presets = {
  'default': require('./preset/default.json'),
  'jquery': require('./preset/jquery.json')
};


exports.set = function(opts) {
  var preset = opts && opts.preset ? opts.preset : 'default';
  // we need to pass all the user settings and default settings to the plugins
  // so they are able to toggle the behavior and make changes based on the
  // options
  _curOpts = mergeOptions(preset, opts);

  // FIXME: deprecate AlignComments on v1.0
  // on v0.6.0 we named the property starting with uppercase "A" by mistake, so
  // now we need to support both styles to keep consistency :(
  if (_curOpts.indent && 'AlignComments' in _curOpts.indent) {
    _curOpts.indent.alignComments = _curOpts.indent.AlignComments;
  }

  _ws.setOptions(_curOpts.whiteSpace);
  _br.setOptions(_curOpts.lineBreak);
  indent.setOptions(_curOpts.indent);
  plugins.setOptions(_curOpts);

  // user provided options should override default settings and also any
  // changes made by plugins
  if (opts) {
    _curOpts = deepMixIn(_curOpts, opts);
  }
};


function mergeOptions(preset, opts) {
  if (!(preset in exports.presets)) {
    throw new Error('Invalid preset file "' + preset + '".');
  }
  var baseOpts = exports.presets[preset];
  // recursively merge options to allow a "prototype chain"
  if (baseOpts.preset) {
    baseOpts = mergeOptions(baseOpts.preset, baseOpts);
  }
  return merge({}, baseOpts, opts);
}


exports.get = function(prop) {
  return prop ? get(_curOpts, prop) : _curOpts;
};


exports.getRc = getRc;
function getRc(filePath, customOptions) {
  // if user sets the "preset" we don't load any other config file
  // we assume the "preset" overrides any user settings
  if (isTopLevel(customOptions)) {
    return customOptions;
  }

  if (isObject(filePath)) {
    customOptions = filePath;
    filePath = null;
  }
  // we search for config file starting from source directory or from cwd if
  // path is not provided
  var basedir = filePath ? path.dirname(filePath) : process.cwd();
  var cwd = process.cwd();
  var rc = findAndMergeConfigs(basedir);
  if (isEmpty(rc) && basedir !== cwd) {
    rc = findAndMergeConfigs(cwd);
  }
  var tmpConfig = !isEmpty(rc) ? rc : getGlobalConfig();
  return merge(tmpConfig, customOptions);
}


function findAndMergeConfigs(basedir) {
  if (!basedir || !basedir.length) return;

  var configFiles = ['.esformatter', 'package.json'];
  var config;

  configFiles.some(function(name) {
    var filePath = path.join(basedir, name);
    if (!fs.existsSync(filePath)) return;

    var cur = loadAndParseConfig(filePath);
    if (name === 'package.json') {
      cur = cur.esformatter;
    }

    if (!cur) return;

    // we merge configs on same folder as well just in case user have
    // ".esformatter" and "package.json" on same folder
    // notice that ".esformatter" file takes precedence and will override the
    // "package.json" settings.
    config = config ? merge(cur, config) : cur;

    // stop the loop
    if (isTopLevel(config)) return true;
  });

  if (isTopLevel(config)) {
    return config;
  }

  // we merge configs from parent folders so it's easier to add different rules
  // for each folder on a project and/or override just specific settings
  var parentDir = path.resolve(basedir, '..');
  // we need to check if parentDir is different from basedir to avoid conflicts
  // on windows (see #174)
  var parentConfig = parentDir && parentDir !== basedir ?
    findAndMergeConfigs(parentDir) :
    {};
  // notice that current folder config overrides the parent folder config
  return merge(parentConfig, config);
}


function isTopLevel(config) {
  // if config contains 'root:true' or inherit from another "preset" we
  // consider it as top-level and don't merge the settings with config files on
  // parent folders.
  return config && (config.root || config.preset);
}


function getGlobalConfig() {
  var file = path.join(userHome, '.esformatter');
  return fs.existsSync(file) ? loadAndParseConfig(file) : {};
}


exports.loadAndParseConfig = loadAndParseConfig;
function loadAndParseConfig(file) {
  try {
    return JSON.parse(stripJsonComments(fs.readFileSync(file).toString()));
  } catch (e) {
    // include file name and let user know error was caused by config file
    // parsing. this is redundant for ENOENT errors but very helpful for
    // JSON.parse
    throw new Error(
      "Can't parse configuration file '" + file + "'. Exception: " + e.message
    );
  }
}
