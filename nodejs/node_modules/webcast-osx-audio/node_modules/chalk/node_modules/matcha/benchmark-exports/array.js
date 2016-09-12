var arr = [1, 2, 3, 4, 5, 6];

exports['array slice'] = {
    options: {
      iterations: 2000000
    }

  , bench: {
        'Array.prototype.slice': function () {
          var args = Array.prototype.slice.call(arr, 1);
        }

      , 'for loop': function () {
          var l = arr.length
            , args = new Array(l - 1);
          for (var i = 1; i < l; i++) args[i - 1] = arr[i];
        }
    }
};
