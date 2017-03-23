#!/usr/bin/env node
/**
 * chromecast commandline utility.
 *
 * @since 0.0.1
 */
'use strict';

var fs = require('fs');
var chalk = require('chalk');
var error = chalk.bold.red;
var Cli = require('../lib/cli.js');

var cli = new Cli().parse(process.argv.slice(2), function(err, message, options) {
  if (err) {
    console.error(error('\nYou had errors in your syntax. Use --help for further information.'));
    err.forEach(function (e) {
      console.error(e.message);
    });
  }
  else if (message) {
    console.log(message);
  }
  else {
    var chromecast = require('../')(options);
	}
});

