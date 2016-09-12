switch ( event.keyCode )
{
case $.ui.keyCode.ENTER:
case $.ui.keyCode.SPACE:
case $.ui.keyCode.DOWN_ARROW:
  // line comment
  z();
  break

case $.ui.keyCode.ESCAPE:
  y();
  break;

default:
  x();
}

switch ( event.keyCode )
{
case $.ui.keyCode.ENTER:
  whatever = 'nothing';
  break

case $.ui.keyCode.ESCAPE:
  whatever = 'something';
  break;

default:
  x();
}

call(function() {
  switch ( fruit )
  {
  case Fruit.APPLE:
    // line comment
    exotic();
    break;

  default:
    unknown();
  }
});
