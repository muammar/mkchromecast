'use strict';

exports.__esModule = true;
exports.default = hashify;
exports.hashArray = hashArray;
exports.hashObject = hashObject;
/**
 * utilities for hashing config objects.
 * basically iteratively updates hash with a JSON-like format
 */

var stringify = JSON.stringify;

function hashify(hash, value) {
  if (value instanceof Array) {
    hashArray(hash, value);
  } else if (value instanceof Object) {
    hashObject(hash, value);
  } else {
    hash.update(stringify(value) || 'undefined');
  }

  return hash;
}

function hashArray(hash, array) {
  hash.update('[');
  for (var i = 0; i < array.length; i++) {
    hashify(hash, array[i]);
    hash.update(',');
  }
  hash.update(']');

  return hash;
}

function hashObject(hash, object) {
  hash.update('{');
  Object.keys(object).sort().forEach(function (key) {
    hash.update(stringify(key));
    hash.update(':');
    hashify(hash, object[key]);
    hash.update(',');
  });
  hash.update('}');

  return hash;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImNvcmUvaGFzaC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7a0JBT3dCLE87UUFZUixTLEdBQUEsUztRQVdBLFUsR0FBQSxVO0FBOUJoQjs7Ozs7QUFLQSxJQUFNLFlBQVksS0FBSyxTQUF2Qjs7QUFFZSxTQUFTLE9BQVQsQ0FBaUIsSUFBakIsRUFBdUIsS0FBdkIsRUFBOEI7QUFDM0MsTUFBSSxpQkFBaUIsS0FBckIsRUFBNEI7QUFDMUIsY0FBVSxJQUFWLEVBQWdCLEtBQWhCO0FBQ0QsR0FGRCxNQUVPLElBQUksaUJBQWlCLE1BQXJCLEVBQTZCO0FBQ2xDLGVBQVcsSUFBWCxFQUFpQixLQUFqQjtBQUNELEdBRk0sTUFFQTtBQUNMLFNBQUssTUFBTCxDQUFZLFVBQVUsS0FBVixLQUFvQixXQUFoQztBQUNEOztBQUVELFNBQU8sSUFBUDtBQUNEOztBQUVNLFNBQVMsU0FBVCxDQUFtQixJQUFuQixFQUF5QixLQUF6QixFQUFnQztBQUNyQyxPQUFLLE1BQUwsQ0FBWSxHQUFaO0FBQ0EsT0FBSyxJQUFJLElBQUksQ0FBYixFQUFnQixJQUFJLE1BQU0sTUFBMUIsRUFBa0MsR0FBbEMsRUFBdUM7QUFDckMsWUFBUSxJQUFSLEVBQWMsTUFBTSxDQUFOLENBQWQ7QUFDQSxTQUFLLE1BQUwsQ0FBWSxHQUFaO0FBQ0Q7QUFDRCxPQUFLLE1BQUwsQ0FBWSxHQUFaOztBQUVBLFNBQU8sSUFBUDtBQUNEOztBQUVNLFNBQVMsVUFBVCxDQUFvQixJQUFwQixFQUEwQixNQUExQixFQUFrQztBQUN2QyxPQUFLLE1BQUwsQ0FBWSxHQUFaO0FBQ0EsU0FBTyxJQUFQLENBQVksTUFBWixFQUFvQixJQUFwQixHQUEyQixPQUEzQixDQUFtQyxlQUFPO0FBQ3hDLFNBQUssTUFBTCxDQUFZLFVBQVUsR0FBVixDQUFaO0FBQ0EsU0FBSyxNQUFMLENBQVksR0FBWjtBQUNBLFlBQVEsSUFBUixFQUFjLE9BQU8sR0FBUCxDQUFkO0FBQ0EsU0FBSyxNQUFMLENBQVksR0FBWjtBQUNELEdBTEQ7QUFNQSxPQUFLLE1BQUwsQ0FBWSxHQUFaOztBQUVBLFNBQU8sSUFBUDtBQUNEIiwiZmlsZSI6ImNvcmUvaGFzaC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogdXRpbGl0aWVzIGZvciBoYXNoaW5nIGNvbmZpZyBvYmplY3RzLlxuICogYmFzaWNhbGx5IGl0ZXJhdGl2ZWx5IHVwZGF0ZXMgaGFzaCB3aXRoIGEgSlNPTi1saWtlIGZvcm1hdFxuICovXG5cbmNvbnN0IHN0cmluZ2lmeSA9IEpTT04uc3RyaW5naWZ5XG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGhhc2hpZnkoaGFzaCwgdmFsdWUpIHtcbiAgaWYgKHZhbHVlIGluc3RhbmNlb2YgQXJyYXkpIHtcbiAgICBoYXNoQXJyYXkoaGFzaCwgdmFsdWUpXG4gIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBPYmplY3QpIHtcbiAgICBoYXNoT2JqZWN0KGhhc2gsIHZhbHVlKVxuICB9IGVsc2Uge1xuICAgIGhhc2gudXBkYXRlKHN0cmluZ2lmeSh2YWx1ZSkgfHwgJ3VuZGVmaW5lZCcpXG4gIH1cblxuICByZXR1cm4gaGFzaFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaEFycmF5KGhhc2gsIGFycmF5KSB7XG4gIGhhc2gudXBkYXRlKCdbJylcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnJheS5sZW5ndGg7IGkrKykge1xuICAgIGhhc2hpZnkoaGFzaCwgYXJyYXlbaV0pXG4gICAgaGFzaC51cGRhdGUoJywnKVxuICB9XG4gIGhhc2gudXBkYXRlKCddJylcblxuICByZXR1cm4gaGFzaFxufVxuXG5leHBvcnQgZnVuY3Rpb24gaGFzaE9iamVjdChoYXNoLCBvYmplY3QpIHtcbiAgaGFzaC51cGRhdGUoJ3snKVxuICBPYmplY3Qua2V5cyhvYmplY3QpLnNvcnQoKS5mb3JFYWNoKGtleSA9PiB7XG4gICAgaGFzaC51cGRhdGUoc3RyaW5naWZ5KGtleSkpXG4gICAgaGFzaC51cGRhdGUoJzonKVxuICAgIGhhc2hpZnkoaGFzaCwgb2JqZWN0W2tleV0pXG4gICAgaGFzaC51cGRhdGUoJywnKVxuICB9KVxuICBoYXNoLnVwZGF0ZSgnfScpXG5cbiAgcmV0dXJuIGhhc2hcbn1cbiJdfQ==