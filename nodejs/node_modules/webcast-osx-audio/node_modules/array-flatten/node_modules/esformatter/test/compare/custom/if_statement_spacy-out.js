if ( true ) {
  doStuff()
}

if ( foo || bar ) {
  if ( bar === 'bar' ) {
    // nested
    log('nested if');
  } else {
    log('nested else')
  }
} else if ( baz == null ) {
  // else if
  log('elseif');
} else {
  // else
  log('else');
  // should keep the 2 empty lines


}

if ( singleLine ) singleLine();


// it's a trap!
if ( asi && noBraces )
  dolor()
else
  amet();

