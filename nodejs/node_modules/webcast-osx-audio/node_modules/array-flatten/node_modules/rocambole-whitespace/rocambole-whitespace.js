'use strict';

// white space helpers

var _tk = require('rocambole-token');
var repeat = require('repeat-string');
var debug = require('debug');
var debugBefore = debug('rocambole:ws:before');
var debugAfter = debug('rocambole:ws:after');

// fallback in case plugin author forgets to call setOptions
var _curOpts = {
  value: ' ',
  before: {},
  after: {}
};


// ---


exports.setOptions = setOptions;
function setOptions(opts) {
  _curOpts = opts;
}


// --


exports.limit = limit;
function limit(token, typeOrValue) {
  limitBefore(token, typeOrValue);
  limitAfter(token, typeOrValue);
}


exports.limitBefore = limitBefore;
function limitBefore(token, typeOrValue) {
  var amount = expectedBefore(typeOrValue);
  debugBefore(
    'typeOrValue: %s, amount: %s, token: %s',
    typeOrValue, amount, token.value
  );
  if (amount < 0) return; // noop
  update('before', token, amount);
}


exports.limitAfter = limitAfter;
function limitAfter(token, typeOrValue) {
  var amount = expectedAfter(typeOrValue);
  debugAfter(
    'typeOrValue: %s, amount: %s, token: %s',
    typeOrValue, amount, token.value
  );
  if (amount < 0) return; // noop
  update('after', token, amount);
}


exports.expectedAfter = expectedAfter;
function expectedAfter(typeOrValue) {
  return getAmount('after', typeOrValue);
}


exports.expectedBefore = expectedBefore;
function expectedBefore(typeOrValue) {
  return getAmount('before', typeOrValue);
}


function getAmount(position, typeOrValue) {
  if (typeof typeOrValue === 'number') {
    return typeOrValue;
  }
  var amount = _curOpts[position][typeOrValue];
  return amount == null ? -1 : amount;
}


function update(position, target, amount) {
  var adjacent = position === 'before' ? target.prev : target.next;
  var adjacentIsWs = _tk.isWs(adjacent);

  if (!adjacent || _tk.isBr(adjacent)) return;

  if (amount === 0 && adjacentIsWs) {
    _tk.remove(adjacent);
    return;
  }

  var ws;
  if (adjacentIsWs) {
    ws = adjacent;
  } else {
    ws = {
      type: 'WhiteSpace'
    };
  }
  ws.value = repeat(_curOpts.value || ' ', amount);

  if (!adjacentIsWs) {
    _tk[position](target, ws);
  }
}
