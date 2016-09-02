for (i=0; i<n;++i ) {x(); }

for(;i<n;++i){
  x();
}

for ( ;   ; ++i ) {
  x();
}

for ( i = 0; ; ) {
  x();
}

for ( ; i < n; ++i ) {
  for ( ; j > 0; --j ) {
    x();
  }
}

for(;;  ) {
  x();
}

function foo() {
  for (var c   =   this._bindings.length, d;c--;)
    x += 1;
  return -1;
}

for  (  i = 0;i<   10;i++) foo();
for (i=10; i <   10; i++   )
  bar();
