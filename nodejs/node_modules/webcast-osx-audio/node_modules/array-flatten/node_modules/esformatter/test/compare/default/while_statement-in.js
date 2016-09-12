// no parens and asi
while(cur=items[i++]) log(cur.name);

    // wrong indent and line breaks
   while(
       ++n <
       10
   ) {
            log(n)                
   }

    // no body
  while (   foo()  );

// break before open curly brace and lots of spaces
while  (    true   )
{
// comment inside
                    foo();       
}

while (n--){
// nested
while(i++){
// moar nested
while(z++<0) {
    // inception
    foo();
    while(j++) {
         // deeper
    bar();
    }
}
}
}


// no body #2
while (true )
  ;

