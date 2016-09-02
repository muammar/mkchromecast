;(++n<10);
;   (a==b);
(  c  ===  d  );
x = (value / 10);
if (r * (x+1)+(y+2)) {
    y = ("123"+"3456");
    // parseInt() is the "catch" on this case
    z = ((q + w) / (parseInt('abc', 16) * (7) ))
}


// edge cases
// ==========

// not a bynary expression or a ExpressionStatement
// VariableDeclaration > VariableDeclarator > [Identifier + Literal]
var foo = (123);


// SequenceExpression
madness = (weird,stuff),(45,56)

;(bar());
(function(){})();
(function(){}());

function returnTest() {
  return (x > 1);
}

function returnTest2() {
  return ( y + 1 );
}

function returnTest3(amount) {
  return amount + " result" + (amount > 1 ? "s" : "");
}

function returnTest4() {
  return (a || b < 0) && y();
}


fn((1 + 3) + 4);
