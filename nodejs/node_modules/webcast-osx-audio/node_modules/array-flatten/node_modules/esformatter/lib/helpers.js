"use strict";

exports.shouldIndentChild = shouldIndentChild;
function shouldIndentChild(parent, child, opts) {
  // this will avoid indenting objects/arrays/functions twice if they
  // are on left/right of a BinaryExpression, LogicalExpression or
  // UnaryExpression
  if (!child || !opts[parent.type + '.' + child.type]) {
    return false;
  }

  var left = child.left;
  var right = child.right;
  return !right || (!opts[right.type] && !opts[left.type]);
}
