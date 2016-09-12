#!/usr/bin/env node

// This file is automatically ran through standard-format
// and checked by standard. Add test cases for the formatter by adding
// to this file
var noop = require('noop')

// eol semicolons
var x = 1;

// eol whitespace
x = 2 

// standard-format has nothing to say about unused vars
// so this is here to prevent invalid test cases
console.log(x)

//bad comment -- needs a space after slashes
var test = "what";

if(test) {
  ["a","b","c"].forEach(function (x) { 
    // test: infix commas
    console.log(x*2); 
  })
}

var obj = {val: 2}
var another = { foo: 'bar' }

// space after function name and arg paren
;[1].forEach(function(){})

// space after argument paren
function f2 (x,y,z){}
function   fooz() {}
function   foox () {}
function   foos   () {}

var anon = function() {}

f2( obj)
f2(obj )
f2( obj )
f2( obj, obj )
f2( obj,obj )
fooz()
foox()
foos()
anon(another)

function foo(){}
function bar() {}
function quux()  {}


foo()
bar()
quux()


function food (){}
function foot ()  {}


food()
foot()


// test: no block padding
var lessThanThreeNewlines = function () {

  return 2;
}
lessThanThreeNewlines()

// at most one newline after opening brace
function noExtraNewlines() {


  return 2;
}
noExtraNewlines()

// at most one newline after opening brace
function noExtraSingle() { return 2 }
noExtraSingle()

// at most one newline after opening brace
function noExtraBraces() {


  if (noExtraBraces != null) 

  {

    return 42
  }

  else 

  {

    return 42
  }

  switch(noExtraBraces) 

  {

  case null:
    return 42
  }

  try 

  {

    return 42
  }
  catch (e) 
  
  {
  }

  for (var i in noExtraBraces) {

    return i
  }
}
noExtraBraces()


// weird bug function
for (var i = 0 ; i < 42; i++ ) {
}

function getRequests (cb) {
  foo({
  }, function (err, resp, body) {
      cb(err, resp, body)
  })
}
getRequests()

// jsx
var React = require('react')

var testClass = React.createClass({
  render: function () {
    return (
      <div className='testClass'></div>
    )
  }
})

module.exports = testClass

// spacing around Property names (key-spacing)
void {
  testing :123
}

// Test start of line semicolins
var gloopy = 12
[1,2,3].map(function () {})
console.log(gloopy)

// Test member accessors
var array = [1,2,3]
var val = array[0]
var val2 = array[1]
noop(val, val2)
