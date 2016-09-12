// next
switch (foo) {
  // next
  case bar:
    // next
    baz();
    // this should be aligned with previous line since comment block is
    // followed by an empty line

  // next
  case biz:
    // next
    what();
// next
}
// previous

// next
function empty(
  // > indent
  // > indent
)
// next
// next
{
  // > indent
  // > indent
}
// prev

function empty2() {
  // > indent

  // next
  if (foo) {
    // >> indent
  }

  // next
  function empty3() {
    // >> indent

    // next
    foo();
  }
  // prev

  // next
  switch (a) {
    // next
    case 'lorem':
      // next
      dolor();
      // next
      break;
  // next
  }
}

// next
;(function() {
// next
var bar = 'baz';
// next
}());
// prev

// next
class Foo extends Bar {
  // > indent

  constructor(bar) {
    this.bar = bar;
  }

  // prev

  method() {
    // > indent
  }
  //prev

// next
}
// prev

function foo() {

  // > indent
  // > indent

}

foo
  .bar();

// next

function dolor() {
  return 123;

  // prev

}

function bar() {
  foo();

  // > indent
  // > indent

  baz();
}

// prev
