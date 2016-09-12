function matchAny( type, types ) {
  types = types || [ ];
  for (var i = 0, len = types.length; i < len; i++) {
    if ( type === types[ i ] ) {
      return true;
    }
  }
  return false;
}

module.exports = function findParent( /*node, type */ ) {
  var args = [ ].slice.call( arguments );
  var node = args.shift();

  while (node.parent) {
    if ( matchAny( node.parent.type, args ) ) {
      return node.parent;
    }
    node = node.parent;
  }
  return null;
};
