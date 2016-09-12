var assert = require('assert'),
    eaw = require('../eastasianwidth');

describe('eastAsianWidth', function() {
  it('Fullwidth', function() {
    assert.equal('F', eaw.eastAsianWidth('￠'));
    assert.equal('F', eaw.eastAsianWidth('￦'));
  });

  it('Halfwidth', function() {
    assert.equal('H', eaw.eastAsianWidth('｡'));
    assert.equal('H', eaw.eastAsianWidth('ￜ'));
  });

  it('Wide', function() {
    assert.equal('W', eaw.eastAsianWidth('ㄅ'));
    assert.equal('W', eaw.eastAsianWidth('뀀'));
  });

  it('Narrow', function() {
    assert.equal('Na', eaw.eastAsianWidth('¢'));
    assert.equal('Na', eaw.eastAsianWidth('⟭'));
    assert.equal('Na', eaw.eastAsianWidth('a'));
  });

  it('Ambiguous', function() {
    assert.equal('A', eaw.eastAsianWidth('⊙'));
    assert.equal('A', eaw.eastAsianWidth('①'));
  });

  it('Natural', function() {
    assert.equal('N', eaw.eastAsianWidth('ب'));
    assert.equal('N', eaw.eastAsianWidth('ف'));
  });
});

describe('characterLength', function() {
  it('Fullwidth', function() {
    assert.equal(2, eaw.characterLength('￠'));
    assert.equal(2, eaw.characterLength('￦'));
  });

  it('Halfwidth', function() {
    assert.equal(1, eaw.characterLength('｡'));
    assert.equal(1, eaw.characterLength('ￜ'));
  });

  it('Wide', function() {
    assert.equal(2, eaw.characterLength('ㄅ'));
    assert.equal(2, eaw.characterLength('뀀'));
  });

  it('Narrow', function() {
    assert.equal(1, eaw.characterLength('¢'));
    assert.equal(1, eaw.characterLength('⟭'));
    assert.equal(1, eaw.characterLength('a'));
  });

  it('Ambiguous', function() {
    assert.equal(2, eaw.characterLength('⊙'));
    assert.equal(2, eaw.characterLength('①'));
  });

  it('Natural', function() {
    assert.equal(1, eaw.characterLength('ب'));
    assert.equal(1, eaw.characterLength('ف'));
  });
});


describe('length', function() {
  it('Fullwidth', function() {
    assert.equal(10, eaw.length('あいうえお'));
  });

  it('Halfwidth', function() {
    assert.equal(7, eaw.length('abcdefg'));
  });

  it('Mixed', function() {
    assert.equal(19, eaw.length('￠￦｡ￜㄅ뀀¢⟭a⊙①بف'));
  });
});
