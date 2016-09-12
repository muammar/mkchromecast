"use strict";

// basic ====

var singleQuote = "single";
var doubleQuote = "double";


// avoid escaping ====

var avoidSingle = 'single "quote"';
var avoidDouble = "double 'quote'";


// escaping ====

var lorem = "ipsum \"dolor\" sit 'amet'";
var maecennas = "ipsum 'dolor' sit \"amet\"";

var unnecessaryEscape = "bar 'baz' \"dolor\"";

var escapedSlashesSingle = 'bar \\"baz\\"';
var escapedSlashesDouble = "bar \\'baz\\'";

var leadingSingle = "'";
var leadingDouble = '"';
var unnecessaryEscapeSingle = "'";

var successiveQuotes = " '' \"\"";


// multiline strings ====

var multi1 = "multiline \
madness \
\"quotes\" \
'everywhere'".substr(0, 15)

var multi2 = "even more \
multiline \
'strings' \
\"which is one of the \
saddest things about JS\"".substr(15, 15)

var multiAvoidSingle = 'lorem \
ipsum "dolor"';

var multiAvoidDouble = "dolor sit \
ipsum 'dolor'";

