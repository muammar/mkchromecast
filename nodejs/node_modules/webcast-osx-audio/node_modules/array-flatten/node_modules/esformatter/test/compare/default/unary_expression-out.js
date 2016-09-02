!a
!!foo
!(foo);
;(!!foo)
!(!foo);
!!(!foo);

-x;
-y;

~a; //bitwise NOT is unary

// these are actually UpdateExpression
++foo;
foo++;
--bar;
bar--;

// delete is a UnaryExpression
delete foo.bar;
delete bar.amet;

// issue #347
delete foo['bar'];
delete bar['amet'];

// need to check indent as well
function fn() {
  !!(!foo);
  delete this.bar
  delete this.amet;
  delete this.ipsum;

  delete this['bar']
  delete this['amet'];
  delete this['ipsum'];
}

typeof a === "number" ? x : y;

var s = 'a string';
console.log(typeof s);

void 0;
