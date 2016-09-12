for (key in obj) {
  doFoo(obj[key]);
}
// we do not remove line breaks! (we assume user knows what he is doing)
for (key
  in obj) doFoo(obj[key]);

for (var k in o) {
  console.log(k, o[k]);
}

for (key in obj) {
  for (prop in obj[key]) {
    //indent
    console.log(prop)
  }
}

// issue #13 : ForInStatement should not mess with inline object indent
function iss13() {
  for (i in {submit: true, change: true, focusin: true}) {
    console.log(i);
  }
}

// keep empty statement on one line
var key;
for (key in obj) {}






for (key in obj) {
  // line breaks, weird spaces and multiple empty lines before
  doFoo(obj[key]);
}

// no {}
for (key in obj) doFoo(obj[key]);
for (k in o)
  fn(o[k]);

