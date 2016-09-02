// #286
class Foo extends Bar {
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
class Foo extends Bar {
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
class Foo extends Bar {
}
// The value to be extended can be produced by an arbitrary expression.
class Foo extends BarNamespace.Bar {
}
class Foo extends BarNamespace['Bar'].Bar["Bar"]('bar').Bar("bar", "bar") {
}
class Foo extends (BarNamespace.bar)() {
}
