import 'es6-collections';
import escope from 'escope';
import findLast from 'lodash.findlast';

const scopeMap = new WeakMap();

export default function findScope(node, ast) {
  if (!scopeMap.has(ast)) {
    scopeMap.set(ast, escope.analyze(ast));
  }
  let scopeManager = scopeMap.get(ast);

  // Find the scope closest to the node (they are sorted)
  return findLast(scopeManager.scopes, scope => {
    let {start, end} = scope.block;
    return node.start >= start && node.end <= end;
  });
}
