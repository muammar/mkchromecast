"use strict";

var express = require('express');
var fs = require('fs');
var mkdirp = require('mkdirp');
var middleware = require('../lib/middleware');
var os = require('os');
var request = require('supertest');
var assert = require('assert');
var copySync = require('fs-extra').copySync;
var path = require('path');

var tmpDest = __dirname + '/artifacts';
var clearCache = function(filename) {
  if(fs.existsSync(tmpDest + '/' + filename)) {
    // Unlinking file since it is cached without reguard to params.
    // TODO: Remove when the imports cache is aware of params.
    fs.unlinkSync(tmpDest + '/' + filename);
  }
};

var setupExpress = function(src, options, staticDest) {
  staticDest = staticDest || options.dest;
  options = options || {};
  var app = express();
  app.use(middleware(src, options));
  app.use(express.static(staticDest));
  return app;
}

describe('middleware', function(){
  describe('simple', function(){
    var app = setupExpress(__dirname + '/fixtures', {
      dest: tmpDest
    });

    it('should process simple less files', function(done){
      var expected = fs.readFileSync(__dirname + '/fixtures/simple-exp.css', 'utf8');
      request(app)
        .get('/simple.css')
        .expect(200)
        .expect(expected, done);
    });
  });

  describe('source map', function(){
    var app = setupExpress(__dirname + '/fixtures', {
      dest: tmpDest,
      force: true, // Need to force since using the same file as the simple test.
      render: {
        sourceMap: {
          sourceMapBasepath: __dirname + '/fixtures'
        }
      }
    });

    it('should handle source map files', function(done){
      var expected = fs.readFileSync(__dirname + '/fixtures/simple-exp.css.map', 'utf8');
      request(app)
        .get('/simple.css.map')
        .expect(200)
        .expect(expected, done);
    });
  });

  describe('import', function(){
    var app = setupExpress(__dirname + '/fixtures', {
      dest: tmpDest
    });

    it('should process less files with imports', function(done){
      var expected = fs.readFileSync(__dirname + '/fixtures/importSimple-exp.css', 'utf8');
      request(app)
        .get('/importSimple.css')
        .expect(200)
        .expect(expected, done);
    });

    it('should process less files with nested imports', function(done){
      var expected = fs.readFileSync(__dirname + '/fixtures/import-exp.css', 'utf8');
      request(app)
        .get('/import.css')
        .expect(200)
        .expect(expected, done);
    });
  });

  describe('options', function(){
    describe('postprocess', function(){
      describe('css', function(){
        var app = setupExpress(__dirname + '/fixtures', {
          dest: tmpDest,
          postprocess: {
            css: function(css, req) {
              return '/* Prepended Comment */\n' + css;
            }
          }
        });

        it('should prepend the comment on all output css', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/postprocessCss-exp.css', 'utf8');
          request(app)
            .get('/postprocessCss.css')
            .expect(200)
            .expect(expected, done);
        });
      });
    });

    describe('preprocess', function(){
      describe('less', function(){
        var app = setupExpress(__dirname + '/fixtures', {
          dest: tmpDest,
          preprocess: {
            less: function(src, req) {
              if (req.query.namespace) {
                src = req.query.namespace + " { " + src + " }";
              }
              return src;
            }
          }
        });

        it('should add namespace when found', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/preprocessLess-exp-a.css', 'utf8');
          clearCache('preprocessLess.css');
          request(app)
            .get('/preprocessLess.css?namespace=h1')
            .expect(200)
            .expect(expected, done);
        });

        it('should not add namespace when none provided', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/preprocessLess-exp-b.css', 'utf8');
          clearCache('preprocessLess.css');
          request(app)
            .get('/preprocessLess.css')
            .expect(200)
            .expect(expected, done);
        });
      });

      describe('path', function(){
        var app = setupExpress(__dirname + '/fixtures', {
          dest: tmpDest,
          preprocess: {
            path: function(pathname, req) {
              return pathname.replace('.ltr', '');
            }
          }
        });

        it('should remove .ltr from the less path when found', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/preprocessPath-exp.css', 'utf8');
          request(app)
            .get('/preprocessPath.ltr.css')
            .expect(200)
            .expect(expected, done);
        });

        it('should not change less path when no matching .ltr', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/preprocessPath-exp.css', 'utf8');
          request(app)
            .get('/preprocessPath.css')
            .expect(200)
            .expect(expected, done);
        });
      });

      describe('importPaths', function(){
        var app = setupExpress(__dirname + '/fixtures', {
          dest: tmpDest,
          preprocess: {
            path: function(pathname, req) {
                var returnPath = pathname.replace(/(\/[0-9\.0-9\.0-9].*\/)/, '/');
                return returnPath;
            },
            importPaths: function(paths, req) {
              var version = req.url.match(/\/([0-9\.0-9\.0-9]*)/);
              var reqPath = path.join(__dirname, 'fixtures', 'external', version[1] , '/');
              var paths = [
                reqPath,
                path.join(reqPath, 'ui')
              ];
              return paths;
            }
          }
        });

        it('should respond with newly mapped paths', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/preprocessParserPaths-exp.css', 'utf8');
          request(app)
            .get('/2.43.3/preprocessParserPaths.css')
            .expect(200)
            .expect(expected, done);
        });
      });

      describe('pathRoot', function(){
        var app = setupExpress('/fixtures', {
          dest: '/artifacts',
          pathRoot: __dirname
        }, tmpDest);

        it('should process simple less files', function(done){
          var expected = fs.readFileSync(__dirname + '/fixtures/pathRoot-exp.css', 'utf8');
          request(app)
            .get('/pathRoot.css')
            .expect(200)
            .expect(expected, done);
        });
      });
    });
  });


  describe('cacheFile', function() {
    var middlewareSrc = tmpDest + '/fixturesCopy';
    var dest = tmpDest + '/cacheFileTest';
    var cacheFile = dest + '/cacheFile.json';
    try {
      mkdirp.sync(middlewareSrc);
    } catch(e) {
      if (e && e.code != 'EEXIST') throw e;
    }
    copySync(__dirname + '/fixtures', middlewareSrc);
    var app;

    var expandExpected = function(file) {
      return file.replace(/\{\$\}/g, middlewareSrc);
    }

    var checkCacheFile = function(cacheFile, expectedFile){
      var sortByPath = function(a, b) {
        var keyA = a.path;
        var keyB = b.path;
        if(keyA < keyB) return -1;
        if(keyA > keyB) return 1;
        return 0;
      };

      return function(){
        // Force cacheFile write.
        middleware._saveCacheToFile();

        var cacheFileExpected = JSON.parse(expandExpected(fs.readFileSync(expectedFile, 'utf8')));
        var cacheFileOutput = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));

        for (var file in cacheFileExpected) {
          assert(cacheFileOutput[file] != undefined);

          var expectedImports = cacheFileExpected[file].imports.sort(sortByPath);
          var outputImports = cacheFileOutput[file].imports.sort(sortByPath);

          assert.equal(outputImports.length, expectedImports.length);

          for (var i = 0; i < expectedImports.length; i++) {
            assert.equal(expectedImports[i].path, outputImports[i].path);
          }
        }
      }
    }

    beforeEach(function() {
      // Unfortunately because cache-related items are stored in globals
      // (which they need to be so that they are shared across different
      // middleware invocations), to properly test the cacheFile option we
      // need to re-require the middleware for each of these tests.
      var mpath = path.resolve(__dirname, '../lib/middleware.js');
      delete require.cache[mpath];
      middleware = require('../lib/middleware');
      app = setupExpress(middlewareSrc, {
        dest: dest,
        cacheFile: cacheFile
      });
    });

    it('should process files correctly and store the right cached imports', function(done){
      var expected = fs.readFileSync(__dirname + '/fixtures/import-exp.css', 'utf8');
      request(app)
        .get('/import.css')
        .expect(200)
        .expect(expected)
        .expect(checkCacheFile(cacheFile, __dirname + '/fixtures/cacheFile-exp.json'))
        .end(done);
    });

    it('should ignore cached imports if the file has changed and update cached imports', function(done){
      copySync(middlewareSrc + '/importSimple.less', middlewareSrc + '/import.less');
      var expected = fs.readFileSync(__dirname + '/fixtures/importSimple-exp.css', 'utf8');
      request(app)
        .get('/import.css')
        .expect(200)
        .expect(expected)
        .expect(checkCacheFile(cacheFile, __dirname + '/fixtures/cacheFile-exp2.json'))
        .end(done);
    });
  });
});
