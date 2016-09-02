for(key of obj){doFoo(obj[key]);}
// we do not remove line breaks! (we assume user knows what he is doing)
for(    key
    of   obj    )doFoo(obj[key]);

for(var k    of    o){
console.log(k, o[k]);
}

for(key of obj  ){
for(prop of obj[key]) {
//indent
console.log(prop)
}
}

// issue #13 : ForOfStatement should not mess with inline object indent
function iss13() {
    for (i of {submit : true, change : true, focusin : true}) {
      console.log(i);
    }
}

// line breaks and weird spaces
for (key of obj)

  {
  doFoo(obj[key]);
}
