var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = findScope;

require("es6-collections");

var escope = _interopRequire(require("escope"));

var findLast = _interopRequire(require("lodash.findlast"));

var scopeMap = new WeakMap();

function findScope(node, ast) {
  if (!scopeMap.has(ast)) {
    scopeMap.set(ast, escope.analyze(ast));
  }
  var scopeManager = scopeMap.get(ast);

  // Find the scope closest to the node (they are sorted)
  return findLast(scopeManager.scopes, function (scope) {
    var _scope$block = scope.block;
    var start = _scope$block.start;
    var end = _scope$block.end;

    return node.start >= start && node.end <= end;
  });
}