// comment alignment (#209)
switch (foo) {
  case bar:
    // lorem
    baz();
    // falls through
    // yes, this should be aligned too

    // this should be at same indent level as `baz();`
  case biz:
    what();
}

// comment alignment (#270)
try {
  bla();
  // comment
  // too
} catch (e) {
  throw e;
}
