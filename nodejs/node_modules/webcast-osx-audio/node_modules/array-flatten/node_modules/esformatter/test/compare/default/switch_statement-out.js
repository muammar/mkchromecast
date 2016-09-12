switch (fruit) {
  // case comment
  case Fruit.APPLE:
    // consequent comment
    apple();
    break;
  case Fruit.BANANA:
    banana();
    // comment in between content
    break;
  // case comment
  case Fruit.MANGO:
  // case comment
  case Fruit.PUPAYA:
    exotic();
    break;
  default:
    // consequent comment
    unknown();
}

call(function() {
  switch (fruit) {
    // case comment
    case Fruit.APPLE:
      // consequent comment
      exotic();
      break;
    default:
      unknown();
  }
});


switch (fruit) {
  // case comment
  case Fruit.APPLE:
    // consequent comment
    apple();
    break;
}

// issue #225
switch (item) {
  case 'one':
    dothis()
    break
  default:
}

// issue #290
switch (x) {
  case true:
    x();
    break;
  default:
    if (x) {
      x();
    }
}

// comment alignment (#209)
switch (foo) {
  case bar:
    baz();
    // falls through
    // yes, this should be aligned too

  // align with case
  case biz:
    what();
}
