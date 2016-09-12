var a = function() {
  return 'b';
};

b = function doB(q, wer, ty) {
  var c = function(n) {
    return function() {
      return q +
        wer - ty;
    }
  }
  return c
}

this.foo = {
  bar: function() {
    var r = function() {
      re(); draw();
      return log('foo') + 'bar';
    };
  },
  ipsum: function(amet) {
    return function() {
      amet()
    }
  }
};

var noop = function() {};


var add = function(a, b) {
  return a + b;
}

call(function(a) {
  b();
});


// issue #36
var obj = {
  then: function( /* fnDone, fnFail, fnProgress */ ) {
    var fns = arguments;
  }
};


// issue #134
var foo = new MyConstructor(function otherFunction() {});



// issue #143
if (!this._pollReceive) {
  this._pollReceive = nn.PollReceiveSocket(this.binding, function(events) {
    if (events) this._receive();
  }.bind(this));
}

// issue #283
var foo = function foo() {
  bar()
}

var foo = function() {
  bar()
}

// default params (#285)
var defaultParams = function defaults(z, x = 1, y = 2) {
  return z + x + y;
}

// issue #373
var foo = function(a,
  b) {};

// issue #350
var foo = function*() {
  yield '123';
  yield '456';
};

var foo = function*() {
  yield '123';
  yield '456';
};

// issue #377
let index = _.findLast(test, function(t) {
  return obj && obj[t]
})
