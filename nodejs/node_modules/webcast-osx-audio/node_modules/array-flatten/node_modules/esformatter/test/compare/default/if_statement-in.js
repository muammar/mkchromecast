if(true){doStuff()}

if(   foo ||bar   ){ if (bar      ===  'bar'){
    // nested
log('nested if'); } else { log('nested else')
} }
else if   (baz==null)
{
            // else if
log('elseif');
}else{
        // else
    log('else');
// should keep the 2 empty lines


}

if(    singleLine  )singleLine();


// it's a trap!
if (asi && noBraces)
dolor()
else
    amet();

// another trap!
if     (   asi    &&   noBraces2   )     dolor()
else        amet();

// issue #7
function iss7(){
    if (wait === true? --jQuery.readyWait : jQuery.isReady) {
        return;
    }
}

// issue #32
if( foo===bar &&
    foo>bar ){
    foo = bar;
}
(function(){
    if( foo===bar &&
        //bla bla bla
        foo>bar ){
        foo = bar;
    }else if(foo>bar||
        foo <=bar){
        foo =bar;
    }else{
        foo = bar;
        if(foo!==bar){
            foo = bar;
        }else if(foo > bar ||
            //Hey ho
    foo<=bar) {
            bar = foo;
        }
    }
})();



// issue #34 (keep line comment on same line)
if ( window.DOMParser ) { // Standard
    tmp = new DOMParser();
    xml = tmp.parseFromString( data , "text/xml" );
} else { // IE
    xml = new ActiveXObject( "Microsoft.XMLDOM" );
    xml.async = "false";
    xml.loadXML( data );
}


// test with multiple lines!
if (
  lorem === ipsum &&
  dolor !== 'amet'
) {
  yeah();
}
if (
  // comment
  lorem === ipsum &&
  // comment
  dolor !== 'amet'
) {
  yeah();
}

// issue #163
if (someInt > 0 && someBool) // some comment
{
  someCode();
}


// issue #161
function test(a) {
  if (a.one) { a.one() }
//test
else
  if (a.two) {
  a.two();
}
}


// issue #196
if(a) a(); // run a
else if(b) b(); // run b
else{
c(); // run c
}


// issue #197
function iss197() {
for (var key in pattern) {

// Ignore some node properties
if (foo) {
continue;
}

// Match array property
if (_.isArray(pattern[key])) {
if (!bar) {
return false;
}

// Match object property
} else if (dolor) {

// Special case rest params (requires knowledge of sibling nodes)
if (ipsum) {
  return ipsum;
} else if (!amet) {
return false;
}

// Match other properties (string, boolean, null, etc.)
} else if (pattern[key] !== node[key]) {
return false;
}
}
return true;
}

// issue #222
var obj;
if (
delete obj.hello
, 'world') {
// more code
}

// issue #297
if (foo) {
  bar()

  // this comment should be indented

  baz();
}
