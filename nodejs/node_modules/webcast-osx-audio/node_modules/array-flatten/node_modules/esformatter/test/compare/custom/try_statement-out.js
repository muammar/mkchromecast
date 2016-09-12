try
{
  foo()
}
catch (e)
{
  log(e)
}

try
{
  // foo comment
  foo();
}
finally
{
  // bar comment
  bar();
}

try
{
  foo()
}
catch (e)
{
  log(e)
}
finally
{
  bar()
}

try
{
  bar("foo");
}
catch (e)
{
  // Empty Catch comment
}


// issue #35: "catch" block indent + empty catch body
jQuery.ready.promise = function(obj) {
  try
  {
    top = window.frameElement == null && document.documentElement;
  }
  catch (e)
  {}
};

// "catch" brace indent
function issueNN(obj) {
  try
  {
    x = y;
  }
  catch (e)
  {
    console.log(e);
  }
}

// "finally" brace indent
function foo(obj) {
  try
  {
    top = window.frameElement == null && document.documentElement;
  }
  catch (e)
  {
    console.log(e);
  }
  finally
  {
    // finally a comment
    top = 0;
  // weird
  }
}

jQuery.ready.promise = function(obj) {
  try
  {
    // try 2
    top = window.frameElement == null && document.documentElement;
  // try after 2
  }
  catch (e)
  {
    // catch 2
    console.log(e);
  // catch after 2
  }
  finally
  {
    // finally a comment 2
    top = 0;
  // finally after 2
  }
};

// nested try-catch
function nestedTryCatch() {
  try
  {
    normalPath();
  }
  catch (e)
  {
    try
    {
      // try
      alternatePath();
    // just a little bit harder
    }
    catch (e)
    {
      // catch
      console.log(e);
    // if you can
    }
    finally
    {}
  }
  finally
  {
    shouldBreak = true;
  }
  next();
}

// line break handling (#128)
try
{
  doStuff()
}
catch (e)
{
  yesThisIsWeird()
}
