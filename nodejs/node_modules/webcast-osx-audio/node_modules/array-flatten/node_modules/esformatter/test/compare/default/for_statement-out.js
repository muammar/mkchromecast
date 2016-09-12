for (
  var i = 0,
    n = things.length;
  i < n;
  i += 1
) {
  // 1
  things[i];
}

for (i = 0; i < n; ++i) { // 2
  things[i];
}

for (; i < n; ++i) {
  foo(i); /* 3 */
}


for (; i < n; ++i) {
  // 4
  for (; j > 0; --j) {
    // 5
    things[i][j];
  }
}

// 6
for (;;) {
  things[i];
}


// 7 : indent + no braces
function foo() {
  for (var c = this._bindings.length, d; c--;)
    if (d = this._bindings[c], d._listener === a && d.context === b) return c;
  return -1
}


// 8: no {}
for (i = 0; i < 10; i++) foo(i);
for (i = 10; i < 10; i++)
  bar(i);

