var foo = "bar";

// some comment
function dolor(){ amet()
}

// no changes until line 19
var a = function() {
  return 'b';
};

// some other comment

thisWontShowOnDiff();
thisShouldBeFirstLineOfLine19Diff();
// yeap this will show too

dolor (	a);
amet();
// EOF
