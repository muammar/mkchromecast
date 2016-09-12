for ( key in obj )
{
  doFoo(obj[key]);
}
// we do not remove line breaks! (we assume user knows what he is doing)
for ( key
  in obj ) doFoo(obj[key]);

for ( var k in o )
{
  console.log(k, o[k]);
}

for ( key in obj )
{
  for ( prop in obj[key] )
  {
    //indent
    console.log(prop)
  }
}

// issue #13 : ForInStatement should not mess with inline object indent
function iss13() {
  for ( i in {submit: true, change: true, focusin: true} )
  {
    console.log(i);
  }
}

// line breaks and weird spaces
for ( key in obj )
{
  doFoo(obj[key]);
}
