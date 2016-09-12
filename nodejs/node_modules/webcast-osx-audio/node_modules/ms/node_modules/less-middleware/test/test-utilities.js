"use strict";

var utilities = require('../lib/utilities');
var assert = require('assert');

describe('utilities', function(){
  describe('#isCompressedPath()', function(){
    it('should match path when valid path found', function(){
      assert.equal(true, utilities.isCompressedPath('styles-min.css'));
      assert.equal(true, utilities.isCompressedPath('styles.min.css'));
    });

    it('should not match path when invalid path found', function(){
      assert.equal(false, utilities.isCompressedPath('styles.css'));
    });
  });

  describe('#isValidPath()', function(){
    it('should match path when valid path found', function(){
      assert.equal(true, utilities.isValidPath('styles.css'));
    });

    it('should not match path when invalid path found', function(){
      assert.equal(false, utilities.isValidPath('styles.less'));
    });
  });
});
