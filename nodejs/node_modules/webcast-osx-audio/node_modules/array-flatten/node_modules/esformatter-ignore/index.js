// escape regex
// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
var escapeRegex = function ( s ) {
  return s.replace( /[-\/\\^$*+?.()|[\]{}]/g, '\\$&' );
};

var replaceBlocks = function ( source ) {
  var blocks = [ ];
  var regex = /\/\*\s*esfmt-ignore-start\s*\*\/((.|\n)*?)\/\*\s*esfmt-ignore-end\s*\*\//g;
  var lineRegex = /^(\s*)((.*?)esfmt-ignore-line(.*))$/gm;
  var counter = 0;

  source = source.replace( regex, function ( match ) {
    var matchFound = '/*esfmt-ignore-block(' + (counter++) + ')*/';
    blocks.push( { source: match, replace: matchFound } );

    return matchFound;
  } );

  source = source.replace( lineRegex, function ( match ) {

    var matchFound = '/*esfmt-ignore-line(' + (counter++) + ')*/';
    blocks.push( {
      source: match,
      replace: new RegExp( '^\\s*' + escapeRegex( matchFound ), 'm' )
    } );

    return matchFound;
  } );

  return { source: source, blocks: blocks };
};

var restoreBlocks = function ( source, blocks ) {
  blocks = blocks || [ ];
  blocks.forEach( function ( block ) {
    source = source.replace( block.replace, block.source );
  } );

  return source;
};

module.exports = {
  stringBefore: function ( code ) {
    this._response = replaceBlocks( code );
    return this._response.source;
  },
  stringAfter: function ( code ) {
    return restoreBlocks( code, this._response.blocks );
  }
};
