'use strict';

module.exports = function protochain(obj) {
  var chain = [];
  var target = getPrototypeOf(obj);
  while (target) {
    chain.push(target);
    target = getPrototypeOf(target);
  }

  return chain;
};

function getPrototypeOf(obj) {
  if (obj == null) return null;
  return Object.getPrototypeOf(Object(obj));
}

