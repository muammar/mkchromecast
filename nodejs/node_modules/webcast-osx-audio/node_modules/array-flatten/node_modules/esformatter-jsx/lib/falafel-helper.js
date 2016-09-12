var falafel = require( 'fresh-falafel' );

module.exports = function ( str, cb ) {
  var opts = require( './parser-options' );
  opts.parser = require( 'babel-core' ); //require( 'acorn-babel' );

  return falafel( str, opts, cb );
};
