for(key of obj){doFoo(obj[key]);}
// we do not remove line breaks! (we assume user knows what he is doing)
for(    key
    of   obj    )doFoo(obj[key]);

for(var k    of    o){
console.log(k, o[k]);
}

for(key of obj){
for(prop of obj[key]) {
//indent
console.log(prop)
}
}

// issue #13 : ForInStatement should not mess with inline object indent
function iss13() {
    for (i of {submit : true, change : true, focusin : true}) {
      console.log(i);
    }
}

// keep empty statement on one line
var key;
for ( key of obj ) {}






for (key of obj)

  {
  // line breaks, weird spaces and multiple empty lines before
  doFoo(obj[key]);
}

// no {}
for ( key of obj ) doFoo(obj[key]);
for (  k    of   o  )
fn(o[k]);
