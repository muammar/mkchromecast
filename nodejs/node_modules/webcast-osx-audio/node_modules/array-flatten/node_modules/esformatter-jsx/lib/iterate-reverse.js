module.exports = function iterateReverse( arr, cb ) {
  arr = arr || [ ];
  var idx = arr.length - 1;

  while (idx >= 0) {
    var item = arr[ idx ];
    cb( item, idx );
    idx--;
  }
};
