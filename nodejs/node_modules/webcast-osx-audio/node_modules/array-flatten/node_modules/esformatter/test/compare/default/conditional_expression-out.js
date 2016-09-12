a ? foo() : bar();

b = (dolor !== amet) ? 'ipsum' : 'dolor';

if (true) {
  // notice that we don't indent since "consequent" is on same line as "test"
  c = !a ? (!foo ? d : function() {
    return a;
  }) : b;
}

// should break lines
foo.a = true;
a ? foo() : bar()


// from jquery
x = function(num) {
  return num == null ?

    // Return a 'clean' array
    this.toArray() :

    // Return just the object
    (object);
}

function x() {
  x.test(y) ?
    a :
    b;
}

num == null ?

  // Return a 'clean' array
  this.toArray() :

  // Return just the object
  (num < 0 ? this[this.length + num] : this[num]);

// issue #253
var format = isSameDate(startDate, endDate) ? this._oneDayLabelFormat :
  'event-multiple-day-duration';

// issue #380
var foo = lorem ?
  ipsum :
  {
    dolor: 'sit'
  };
amet = qwert ?
  asd :
  {
    zxc: 'opi'
  };
