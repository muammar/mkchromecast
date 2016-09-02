/* global describe, it */
'use strict';
import {expect} from 'chai';
import isProtoProp from '../lib/';

describe('is-proto-prop', () => {
  it('should throw error when type or property is not a string', () => {
    function typeTest() {
      isProtoProp(1, 'prop');
    }

    function propTest() {
      isProtoProp('type', 1);
    }

    expect(typeTest).to.throw(TypeError, /Expected a string/);
    expect(propTest).to.throw(TypeError, /Expected a string/);
  });

  it('should return false if not a js type', () => {
    expect(isProtoProp('dog', 'bark')).to.eql(false);
    expect(isProtoProp('gulp', 'task')).to.eql(false);
  });

  it('should return false if property is not on prototype', () => {
    expect(isProtoProp('Array', 'count')).to.eql(false);
    expect(isProtoProp('Error', 'ignore')).to.eql(false);
  });

  it('shoud return true if property is on prototype', () => {
    expect(isProtoProp('Array', 'length')).to.eql(true);
    expect(isProtoProp('Object', 'toString')).to.eql(true);
  });

  it('should be case insensitive for types', () => {
    expect(isProtoProp('array', 'length')).to.eql(true);
    expect(isProtoProp('ARRAY', 'length')).to.eql(true);
  });
});
