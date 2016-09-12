call();
call( x );
call( function() {
  something();
} );
call( {} );
call( {
  x: 1
} );
call( x, {
  x: 1
} );
call( x, function() {
  x();
} );
call( function() {
  x();
}, x );
call( {
  x: 1
}, x );
call( [] );
call( [x, y] );
