/**
 * Function expressions as variables
 */

// Anonymous function expression without body
var foo = function () {};
var fooArg = function (a, b, c) {};

// Named function expression without body
var bar = function bar () {};
var barArg = function barArg (a, b, c) {};

// Anonymous function expression with body
var baz = function () {
  something();
};
var bazArg = function (a, b, c) {
  something();
};

// Named function expression with body
var booz = function booz (a, b, c) {
  something();
};
var boozArg = function boozArg () {
  something();
};

// Generator function
var gen = function * () {};
var gen = function * () {};
var gen = function * () {};

/**
 * Function expression as arguments
 */

// Named function expression with body
call(function test () {
  something();
});
call(x, function test () {
  x();
});
call(function test () {
  x();
}, x);

// Named function expression with body and arguments
call(function testArg (a, b, c) {
  something();
});
call(x, function testArg (a, b, c) {
  x();
});
call(function testArg (a, b, c) {
  x();
}, x)

// Named function expression without body and arguments
call(function test2 () {});
call(x, function test2 () {});
call(function test2 () {}, x);

// Named function expression without body and with arguments
call(function test2Arg (a, b, c) {});
call(x, function test2Arg (a, b, c) {});
call(function test2Arg (a, b, c) {}, x);


// Anonymous function expression with body
call(function () {
  something();
});
call(x, function () {
  x();
});
call(function () {
  x();
}, x);

// Anonymous function expression with body and arguments
call(function (a, b, c) {
  something();
});
call(x, function (a, b, c) {
  x();
});
call(function (a, b, c) {
  x();
}, x);

// Anonymous function expression without body and arguments
call(function () {});
call(x, function () {});
call(function () {}, x);

// Anonymous function expression without body and with arguments
call(function (a, b, c) {});
call(x, function (a, b, c) {});
call(function (a, b, c) {}, x);

/**
 * Function expression as object methods
 */

var object = {
  // Anonymous function expression without body
  foo: function () {},
  fooArg: function (a, b, c) {},

  // Named function expression without body
  bar: function bar () {},
  barArg: function barArg (a, b, c) {},

  // Anonymous function expression with body
  baz: function () {
    something();
  },
  bazArg: function (a, b, c) {
    something();
  },

  // Named function expression with body
  booz: function booz (a, b, c) {
    something();
  },
  boozArg: function boozArg () {
    something();
  },
};

/**
 * Function expression immediate execution
 */

// Anonymous function expression without body
(function () {})();
(function (a, b, c) {})();

// Named function expression without body
(function bar () {})();
(function barArg (a, b, c) {})();

// Anonymous function expression with body
(function () {
  something();
})();
(function (a, b, c) {
  something();
})();

// Named function expression with body
(function booz (a, b, c) {
  something();
})();
(function boozArg () {
  something();
})();


// Anonymous function expression without body
(function () {}());
(function (a, b, c) {}());

// Named function expression without body
(function bar () {}());
(function barArg (a, b, c) {}());

// Anonymous function expression with body
(function () {
  something();
}());
(function (a, b, c) {
  something();
}());

// Named function expression with body
(function booz (a, b, c) {
  something();
}());
(function boozArg () {
  something();
}());

// issue #373
var foo = function (a, b) {};
