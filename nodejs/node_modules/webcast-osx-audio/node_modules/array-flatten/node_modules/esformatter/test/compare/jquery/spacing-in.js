// this file is imcomplete since jquery style guide support is still not
// finished (see #19)

var i = 0;

if (condition) { doSomething(); } else if (otherCondition) {
  somethingElse();
// comment
} else {
// comment
otherThing();
}

this.element
  .add()
  .set({
    // line comment
    // one more
    prop: "value"
  });

while (x) {
  y();
}

for (i = 0; i < length; i++) {
  y();
}
for ( ; i < length; i++ ) {
  y();
}

function x() {
  return something &&
    !somethingElse;
}

ul.outerWidth( Math.max(
  // Firefox wraps long text (possibly a rounding bug)
  // so we add 1px to avoid the wrapping (#7513)
  ul.width( "" ).outerWidth() + 1,
  this.element.outerWidth()
) );

function x() {
  return this.indeterminate ? false :
    Math.min( this.options.max, Math.max( this.min, newValue ) );
}

if ( event.target !== that.element[ 0 ] &&
    event.target !== menuElement &&
    !$.contains( menuElement, event.target ) ) {
  close();
}

contents = this.headers.next()
  .removeClass("ui-helper-reset ui-widget-content ui-corner-bottom " +
    "ui-accordion-content ui-accordion-content-active ui-state-disabled")
  .css("display", "")
  .removeAttr("role");

this.buttonElement
  .addClass( baseClasses )
  .bind( "click" + this.eventNamespace, function( event ) {
    if ( options.disabled ) {
      event.preventDefault();
    }
  });

try {
  x();
} catch(error) {
  console.log(error);
}

x({ a: 1 });
y({
  a: 1
});
$.each( { div: "#list1", ul: "#navigation", dl: "#accordion-dl" } );

(function($) {
  x;
}(jQuery));

var x = {foo:{bar: true}};
var y = {a: b, c: d, e:{ f: g}};
x = {
  props: {
    // comment
    x: 1
  }
};
x={
  b:function b() {
    a();
  },
  a:b
};
