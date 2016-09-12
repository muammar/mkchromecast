// issue #223
( function() {
  var x = 1;
  foo( bar(), baz() );
}() );

// issue #250
( function( $ ) {
  x;
}( jQuery ) );

;!function( x ) {
  console.log( x )
}( 'bar' )
