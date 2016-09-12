'use strict';

var _resolve = require('../core/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {

  var ignoreRegExps = [];
  if (context.options[0] != null && context.options[0].ignore != null) {
    ignoreRegExps = context.options[0].ignore.map(function (p) {
      return new RegExp(p);
    });
  }

  function checkSourceValue(source) {
    if (source == null) return;

    if (ignoreRegExps.some(function (re) {
      return re.test(source.value);
    })) return;

    if ((0, _resolve2.default)(source.value, context) === undefined) {
      context.report(source, 'Unable to resolve path to module \'' + source.value + '\'.');
    }
  }

  // for import-y declarations
  function checkSource(node) {
    checkSourceValue(node.source);
  }

  // for CommonJS `require` calls
  // adapted from @mctep: http://git.io/v4rAu
  function checkCommon(call) {
    if (call.callee.type !== 'Identifier') return;
    if (call.callee.name !== 'require') return;
    if (call.arguments.length !== 1) return;

    var modulePath = call.arguments[0];
    if (modulePath.type !== 'Literal') return;
    if (typeof modulePath.value !== 'string') return;

    checkSourceValue(modulePath);
  }

  function checkAMD(call) {
    if (call.callee.type !== 'Identifier') return;
    if (call.callee.name !== 'require' && call.callee.name !== 'define') return;
    if (call.arguments.length !== 2) return;

    var modules = call.arguments[0];
    if (modules.type !== 'ArrayExpression') return;

    modules.elements.forEach(function (element) {
      if (element.type === 'Literal' && typeof element.value === 'string') {

        // magic modules: http://git.io/vByan
        if (element.value !== 'require' && element.value !== 'exports') {
          checkSourceValue(element);
        }
      }
    });
  }

  var visitors = {
    'ImportDeclaration': checkSource,
    'ExportNamedDeclaration': checkSource,
    'ExportAllDeclaration': checkSource
  };

  if (context.options[0] != null) {
    (function () {
      var _context$options$ = context.options[0];
      var commonjs = _context$options$.commonjs;
      var amd = _context$options$.amd;


      if (commonjs || amd) {
        visitors['CallExpression'] = function (call) {
          if (commonjs) checkCommon(call);
          if (amd) checkAMD(call);
        };
      }
    })();
  }

  return visitors;
}; /**
    * @fileOverview Ensures that an imported path exists, given resolution rules.
    * @author Ben Mosher
    */

module.exports.schema = [{
  'type': 'object',
  'properties': {
    'commonjs': { 'type': 'boolean' },
    'amd': { 'type': 'boolean' },
    'ignore': {
      'type': 'array',
      'minItems': 1,
      'items': { 'type': 'string' },
      'uniqueItems': true
    }
  },
  'additionalProperties': false
}];
//# sourceMappingURL=data:application/json;base64,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LFVBQ1osR0FEWSxxQkFDWixHQURZOzs7QUFHOUIsVUFBSSxZQUFZLEdBQWhCLEVBQXFCO0FBQ25CLGlCQUFTLGdCQUFULElBQTZCLFVBQVUsSUFBVixFQUFnQjtBQUMzQyxjQUFJLFFBQUosRUFBYyxZQUFZLElBQVo7QUFDZCxjQUFJLEdBQUosRUFBUyxTQUFTLElBQVQ7QUFDVixTQUhEO0FBSUQ7QUFSNkI7QUFTL0I7O0FBRUQsU0FBTyxRQUFQO0FBQ0QsQ0E3RUQsQyxDQVBBOzs7OztBQXNGQSxPQUFPLE9BQVAsQ0FBZSxNQUFmLEdBQXdCLENBQ3RCO0FBQ0UsVUFBUSxRQURWO0FBRUUsZ0JBQWM7QUFDWixnQkFBWSxFQUFFLFFBQVEsU0FBVixFQURBO0FBRVosV0FBTyxFQUFFLFFBQVEsU0FBVixFQUZLO0FBR1osY0FBVTtBQUNSLGNBQVEsT0FEQTtBQUVSLGtCQUFZLENBRko7QUFHUixlQUFTLEVBQUUsUUFBUSxRQUFWLEVBSEQ7QUFJUixxQkFBZTtBQUpQO0FBSEUsR0FGaEI7QUFZRSwwQkFBd0I7QUFaMUIsQ0FEc0IsQ0FBeEIiLCJmaWxlIjoicnVsZXMvbm8tdW5yZXNvbHZlZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVPdmVydmlldyBFbnN1cmVzIHRoYXQgYW4gaW1wb3J0ZWQgcGF0aCBleGlzdHMsIGdpdmVuIHJlc29sdXRpb24gcnVsZXMuXG4gKiBAYXV0aG9yIEJlbiBNb3NoZXJcbiAqL1xuXG5pbXBvcnQgcmVzb2x2ZSBmcm9tICcuLi9jb3JlL3Jlc29sdmUnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcblxuICBsZXQgaWdub3JlUmVnRXhwcyA9IFtdXG4gIGlmIChjb250ZXh0Lm9wdGlvbnNbMF0gIT0gbnVsbCAmJiBjb250ZXh0Lm9wdGlvbnNbMF0uaWdub3JlICE9IG51bGwpIHtcbiAgICBpZ25vcmVSZWdFeHBzID0gY29udGV4dC5vcHRpb25zWzBdLmlnbm9yZS5tYXAocCA9PiBuZXcgUmVnRXhwKHApKVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tTb3VyY2VWYWx1ZShzb3VyY2UpIHtcbiAgICBpZiAoc291cmNlID09IG51bGwpIHJldHVyblxuXG4gICAgaWYgKGlnbm9yZVJlZ0V4cHMuc29tZShyZSA9PiByZS50ZXN0KHNvdXJjZS52YWx1ZSkpKSByZXR1cm5cblxuICAgIGlmIChyZXNvbHZlKHNvdXJjZS52YWx1ZSwgY29udGV4dCkgPT09IHVuZGVmaW5lZCkge1xuICAgICAgY29udGV4dC5yZXBvcnQoc291cmNlLFxuICAgICAgICAnVW5hYmxlIHRvIHJlc29sdmUgcGF0aCB0byBtb2R1bGUgXFwnJyArIHNvdXJjZS52YWx1ZSArICdcXCcuJylcbiAgICB9XG4gIH1cblxuICAvLyBmb3IgaW1wb3J0LXkgZGVjbGFyYXRpb25zXG4gIGZ1bmN0aW9uIGNoZWNrU291cmNlKG5vZGUpIHtcbiAgICBjaGVja1NvdXJjZVZhbHVlKG5vZGUuc291cmNlKVxuICB9XG5cbiAgLy8gZm9yIENvbW1vbkpTIGByZXF1aXJlYCBjYWxsc1xuICAvLyBhZGFwdGVkIGZyb20gQG1jdGVwOiBodHRwOi8vZ2l0LmlvL3Y0ckF1XG4gIGZ1bmN0aW9uIGNoZWNrQ29tbW9uKGNhbGwpIHtcbiAgICBpZiAoY2FsbC5jYWxsZWUudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm5cbiAgICBpZiAoY2FsbC5jYWxsZWUubmFtZSAhPT0gJ3JlcXVpcmUnKSByZXR1cm5cbiAgICBpZiAoY2FsbC5hcmd1bWVudHMubGVuZ3RoICE9PSAxKSByZXR1cm5cblxuICAgIGNvbnN0IG1vZHVsZVBhdGggPSBjYWxsLmFyZ3VtZW50c1swXVxuICAgIGlmIChtb2R1bGVQYXRoLnR5cGUgIT09ICdMaXRlcmFsJykgcmV0dXJuXG4gICAgaWYgKHR5cGVvZiBtb2R1bGVQYXRoLnZhbHVlICE9PSAnc3RyaW5nJykgcmV0dXJuXG5cbiAgICBjaGVja1NvdXJjZVZhbHVlKG1vZHVsZVBhdGgpXG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0FNRChjYWxsKSB7XG4gICAgaWYgKGNhbGwuY2FsbGVlLnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuXG4gICAgaWYgKGNhbGwuY2FsbGVlLm5hbWUgIT09ICdyZXF1aXJlJyAmJlxuICAgICAgICBjYWxsLmNhbGxlZS5uYW1lICE9PSAnZGVmaW5lJykgcmV0dXJuXG4gICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMikgcmV0dXJuXG5cbiAgICBjb25zdCBtb2R1bGVzID0gY2FsbC5hcmd1bWVudHNbMF1cbiAgICBpZiAobW9kdWxlcy50eXBlICE9PSAnQXJyYXlFeHByZXNzaW9uJykgcmV0dXJuXG5cbiAgICBtb2R1bGVzLmVsZW1lbnRzLmZvckVhY2goKGVsZW1lbnQpID0+IHtcbiAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdMaXRlcmFsJyAmJlxuICAgICAgICAgIHR5cGVvZiBlbGVtZW50LnZhbHVlID09PSAnc3RyaW5nJykge1xuXG4gICAgICAgIC8vIG1hZ2ljIG1vZHVsZXM6IGh0dHA6Ly9naXQuaW8vdkJ5YW5cbiAgICAgICAgaWYgKGVsZW1lbnQudmFsdWUgIT09ICdyZXF1aXJlJyAmJlxuICAgICAgICAgICAgZWxlbWVudC52YWx1ZSAhPT0gJ2V4cG9ydHMnKSB7XG4gICAgICAgICAgY2hlY2tTb3VyY2VWYWx1ZShlbGVtZW50KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgfVxuXG4gIGNvbnN0IHZpc2l0b3JzID0ge1xuICAgICdJbXBvcnREZWNsYXJhdGlvbic6IGNoZWNrU291cmNlLFxuICAgICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJzogY2hlY2tTb3VyY2UsXG4gICAgJ0V4cG9ydEFsbERlY2xhcmF0aW9uJzogY2hlY2tTb3VyY2UsXG4gIH1cblxuICBpZiAoY29udGV4dC5vcHRpb25zWzBdICE9IG51bGwpIHtcbiAgICBjb25zdCB7IGNvbW1vbmpzLCBhbWQgfSA9IGNvbnRleHQub3B0aW9uc1swXVxuXG4gICAgaWYgKGNvbW1vbmpzIHx8IGFtZCkge1xuICAgICAgdmlzaXRvcnNbJ0NhbGxFeHByZXNzaW9uJ10gPSBmdW5jdGlvbiAoY2FsbCkge1xuICAgICAgICBpZiAoY29tbW9uanMpIGNoZWNrQ29tbW9uKGNhbGwpXG4gICAgICAgIGlmIChhbWQpIGNoZWNrQU1EKGNhbGwpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHZpc2l0b3JzXG59XG5cbm1vZHVsZS5leHBvcnRzLnNjaGVtYSA9IFtcbiAge1xuICAgICd0eXBlJzogJ29iamVjdCcsXG4gICAgJ3Byb3BlcnRpZXMnOiB7XG4gICAgICAnY29tbW9uanMnOiB7ICd0eXBlJzogJ2Jvb2xlYW4nIH0sXG4gICAgICAnYW1kJzogeyAndHlwZSc6ICdib29sZWFuJyB9LFxuICAgICAgJ2lnbm9yZSc6IHtcbiAgICAgICAgJ3R5cGUnOiAnYXJyYXknLFxuICAgICAgICAnbWluSXRlbXMnOiAxLFxuICAgICAgICAnaXRlbXMnOiB7ICd0eXBlJzogJ3N0cmluZycgfSxcbiAgICAgICAgJ3VuaXF1ZUl0ZW1zJzogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgICAnYWRkaXRpb25hbFByb3BlcnRpZXMnOiBmYWxzZSxcbiAgfSxcbl1cbiJdfQ==