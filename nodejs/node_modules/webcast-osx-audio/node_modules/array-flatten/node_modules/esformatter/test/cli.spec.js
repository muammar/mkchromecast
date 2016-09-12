/*jshint node:true*/
/*global describe:false, it:false*/
'use strict';

var spawn = require('child_process').spawn;
var path = require('path');
var fs = require('fs');
var expect = require('chai').expect;
var helpers = require('./helpers');

// ---

function comparePath(filePath) {
  return path.join(__dirname, 'compare', filePath);
}

// ---

describe('Command line interface', function() {
  var filePath;
  var configPath;

  /**
   * Spawn a child process calling the bin file with the specified options
   * @param {String} options Same as you would pass in the command line
   * @param {String} input Standard input
   * @param {Function} testCallback It receives the formatted file
   */
  var spawnEsformatter = function(id, options, input, testCallback) {
    var args = [path.join(__dirname, '../bin/esformatter')];
    if (typeof options === 'function') {
      testCallback = options;
      options = null;
    } else if (typeof input === 'function') {
      testCallback = input;
      input = null;
    }
    if (options) {
      args = args.concat(options.split(' '));
    }
    it('[cli ' + id + '] ' + options, function(mochaCallback) {
      var childprocess = spawn('node', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });
      var output = '';
      var errorInChildProcess = '';
      childprocess.stdout.on('data', function(data) {
        output += data.toString();
      });
      childprocess.stderr.on('data', function(data) {
        errorInChildProcess += data.toString();
      });
      childprocess.on('exit', function() {
        if (errorInChildProcess) {
          testCallback(new Error(errorInChildProcess));
          // we don't check for the error directly because sometimes we want
          // to test if the error is what we expect
          mochaCallback();
        } else {
          try {
            // There is an extra line feed from piping stdout
            testCallback(helpers.lineFeed(output));
            mochaCallback();
          } catch (ex) {
            mochaCallback(ex);
          }
        }
      });
      if (input) {
        try {
          var textInput = fs.readFileSync(input, 'utf-8');
          childprocess.stdin.write(textInput);
          childprocess.stdin.end();
        } catch (ex) {
          mochaCallback(ex);
        }
      }
    });
  };


  // Format a file with default options
  filePath = comparePath('default/array_expression-in.js');
  spawnEsformatter('default', '--preset=default', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/array_expression'));
  });

  // Format a file specifying some options
  filePath = comparePath('custom/basic_function_indent-in.js');
  configPath = comparePath('custom/basic_function_indent-config.json');
  spawnEsformatter('config', '--config ' + configPath + ' ' + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/basic_function_indent'));
  });

  // Format a file from standard input
  filePath = comparePath('default/assignment_expression-in.js');
  spawnEsformatter('stdin', '--preset=default', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/default/assignment_expression'));
  });

  // Format a file from standard input with options
  filePath = comparePath('custom/call_expression-in.js');
  configPath = comparePath('custom/call_expression-config.json');
  spawnEsformatter('stdin+config', '--config ' + configPath, filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/call_expression'));
  });

  // Format file with jquery preset
  filePath = comparePath('jquery/spacing-in.js');
  spawnEsformatter('preset', '--preset jquery ' + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/jquery/spacing'));
  });

  // use settings from package.json file
  filePath = comparePath('rc/package/package-in.js');
  spawnEsformatter('package.json', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/package'));
  });

  // use settings from .esformatter file
  filePath = comparePath('rc/top-in.js');
  spawnEsformatter('rc', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/top'));
  });

  // use settings from .esformatter file
  filePath = comparePath('rc/nested/nested-in.js');
  spawnEsformatter('rc nested', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/nested/nested'));
  });

  // make sure .esformatter file have higher priority than package.json
  filePath = comparePath('rc/package/rc/nested-in.js');
  spawnEsformatter('rc nested package', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/rc/nested'));
  });

  // make sure .esformatter file have higher priority than package.json and
  // that configs are merged even if inside same folder
  filePath = comparePath('rc/package/nested/pkg_nested-in.js');
  spawnEsformatter('nested package+rc', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/rc/package/nested/pkg_nested'));
  });

  // make sure it shows descriptive error message when config doesn't exist
  filePath = comparePath('default/call_expression-in.js');
  spawnEsformatter('invalid config', '-c non-existent.json ' + filePath, function(formattedFile) {
    expect(formattedFile.message).to.contain("Error: Can't parse configuration file 'non-existent.json'");
  });

  // make sure it shows descriptive error message when config file isn't valid
  filePath = comparePath('default/call_expression-in.js');
  configPath = comparePath('error/invalid.json');
  spawnEsformatter('invalid config 2', '-c ' + configPath + ' ' + filePath, function(formattedFile) {
    var configPath = comparePath('error/invalid.json');
    expect(formattedFile.message).to.equal("Error: Can't parse configuration file '" + configPath + "'. Exception: Unexpected token l\n");
  });

  // make sure it shows descriptive error message when file doesn't exist
  spawnEsformatter('invalid file', 'fake-esformatter-123.js', function(formattedFile) {
    expect(formattedFile.message).to.contain("Error: Can't read source file.");
    expect(formattedFile.message).to.contain("fake-esformatter-123.js");
  });

  // comments should be allowed on config.json files
  filePath = comparePath('custom/commented_config-in.js');
  configPath = comparePath('custom/commented_config-config.json');
  spawnEsformatter('config', '--config ' + configPath + ' ' + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/commented_config'));
  });

  // plugins should be loaded from node_modules
  filePath = comparePath('custom/commented_config-in.js');
  configPath = comparePath('custom/commented_config-config.json');
  spawnEsformatter('local plugin', '--config ' + configPath + ' --plugins esformatter-test-plugin ' + filePath, function(formattedFile) {
    expect(formattedFile).to.equal(helpers.readOut('/custom/commented_config').replace(/true/, 'false'));
  });

  // it should use locally installed esformatter version if available
  filePath = comparePath('custom/commented_config-in.js');
  configPath = path.join(__dirname, 'bin/config.json');
  spawnEsformatter('local install', '--config ' + configPath + ' ' + filePath, function(formattedFile) {
    expect(formattedFile.trim()).to.equal('fake-esformatter v0.0.0-alpha');
  });

  // in place option should modify the input file
  var originalInPlace = comparePath('default/inplace-in.js');
  var cpInPlace = comparePath('default/inplace-in.js.copy');
  var expectedInPlace = comparePath('default/inplace-out.js');
  fs.writeFileSync(cpInPlace, fs.readFileSync(originalInPlace));
  spawnEsformatter('default', '-i', cpInPlace, function(formattedFile) {
    fs.unlinkSync(cpInPlace);
    expect(formattedFile).to.equal(fs.readFileSync(expectedInPlace, {
      encoding: 'utf8'
    }));
  });

  // glob expansion
  filePath = comparePath('default/arr*-in.js');
  spawnEsformatter('glob', filePath, function(formattedFile) {
    expect(formattedFile).to.equal(
      helpers.readOut('default/array_expression') +
      helpers.readOut('default/array_pattern') +
      helpers.readOut('default/arrow_function_expression')
    );
  });

  // invalid glob expansion should throw error
  filePath = comparePath('default/fake-file*-in.js');
  spawnEsformatter('glob', filePath, function(formattedFile) {
    var msg = formattedFile.message.trim();
    var filePath = comparePath('default/fake-file*-in.js');
    expect(msg).to.contain("Error: Can't read source file.");
    expect(msg).to.contain(filePath);
  });

  // invalid JS files should throw errors
  filePath = comparePath('error/invalid-*.js');
  spawnEsformatter('invalid js', filePath, function(formattedFile) {
    var msg = formattedFile.message;
    // using match because of absolute path and also because file order might
    // be different in some OS. we just make sure that error message contains
    // what we expect to find
    expect(msg).to.match(/Error: .+invalid-1.js:4 Unexpected token &/);
    expect(msg).to.match(/Error: .+invalid-2.js:3 Invalid regular expression/);
  });

});
