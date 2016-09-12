(function(i){ function h(a,b,c,d,e){this._listener=b;this._isOnce=c;this.context=d;this._signal=a;this._priority=e||0}i.h=h;}(this));


// issue #191
var data = {
  items: (function() {
    return [1, 2, 3, 4];
  }()),
  foo: true
};

// issue #223
( function() {
  var x = 1;
  foo(bar(), baz());
}() );

// issue #250
( function( $ ) {
x;
}( jQuery ) );

;!function( x ) {
  console.log( x )
}( 'bar' )
