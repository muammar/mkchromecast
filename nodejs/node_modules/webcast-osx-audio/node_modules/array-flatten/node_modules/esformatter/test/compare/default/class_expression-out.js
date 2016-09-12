var foo = class Foo extends Bar {
  constructor(properties, name = 'lorem', ...extra) {
    this.properties = properties;
    this.name = name;
    this.extra = extra;
  }
  static log(msg, level = 'log') {
    console[level](msg);
  }
  toObject() {
    return this.properties;
  }
}
let bar = class Foo extends Bar {
  // empty lines in between the MethodDefinition are valid/kept

  constructor(properties) {
    this.properties = properties;
  }

  get prop() {
    return 'getter';
  }

  set prop(val) {
    Foo.log('setting: ', val)
  }

  static log(msg, level = 'log') {
    console[level]('[Foo]', msg);
  }

  toObject() {
    return this.properties;
  }

}

// Multi line declaration
let dolor = class Foo extends Bar {
}
// The value to be extended can be produced by an arbitrary expression.
var amet = class Foo extends BarNamespace.Bar {
}
let ipsum = class Foo extends BarNamespace['Bar'].Bar["Bar"]('bar').Bar("bar", "bar") {
}
const ullamcor = class Foo extends (BarNamespace.bar)() {
}


// issue #358
function makeClass() {
  return class MyClass {
    method() {}
  };
}
