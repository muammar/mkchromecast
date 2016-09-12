if(true)
{
  doStuff()
}

if(foo || bar)
{
  if(bar === 'bar')
  {
    // nested
    log('nested if');
  }
  else
  {
    log('nested else')
  }
}
else if(baz == null)
{
  // else if
  log('elseif');
}
else
{
  // else
  log('else');
  // should keep the 2 empty lines


}

if(singleLine) singleLine();


// it's a trap!
if(asi && noBraces)
  dolor()
else
  amet();



// issue #34 (break line comment into individual line)
if(window.DOMParser)
{ // Standard
  tmp = new DOMParser();
  xml = tmp.parseFromString(data, "text/xml");
}
else
{ // IE
  xml = new ActiveXObject("Microsoft.XMLDOM");
  xml.async = "false";
  xml.loadXML(data);
}


// issue #196
if(a)
  a(); // run a
else if(b)
  b(); // run b
else
{
  c(); // run c
}
