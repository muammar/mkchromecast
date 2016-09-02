'use strict';

var _importType = require('../core/importType');

var _importType2 = _interopRequireDefault(_importType);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function reportIfMissing(context, node, name) {
  if ((0, _importType2.default)(name, context) === 'builtin') {
    context.report(node, 'Do not import Node.js builtin module "' + name + '"');
  }
}

module.exports = function (context) {
  return {
    ImportDeclaration: function handleImports(node) {
      reportIfMissing(context, node, node.source.value);
    },
    CallExpression: function handleRequires(node) {
      if ((0, _staticRequire2.default)(node)) {
        reportIfMissing(context, node, node.arguments[0].value);
      }
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLW5vZGVqcy1tb2R1bGVzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7QUFDQTs7Ozs7O0FBRUEsU0FBUyxlQUFULENBQXlCLE9BQXpCLEVBQWtDLElBQWxDLEVBQXdDLElBQXhDLEVBQThDO0FBQzVDLE1BQUksMEJBQVcsSUFBWCxFQUFpQixPQUFqQixNQUE4QixTQUFsQyxFQUE2QztBQUMzQyxZQUFRLE1BQVIsQ0FBZSxJQUFmLEVBQXFCLDJDQUEyQyxJQUEzQyxHQUFrRCxHQUF2RTtBQUNEO0FBQ0Y7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFVBQVUsT0FBVixFQUFtQjtBQUNsQyxTQUFPO0FBQ0wsdUJBQW1CLFNBQVMsYUFBVCxDQUF1QixJQUF2QixFQUE2QjtBQUM5QyxzQkFBZ0IsT0FBaEIsRUFBeUIsSUFBekIsRUFBK0IsS0FBSyxNQUFMLENBQVksS0FBM0M7QUFDRCxLQUhJO0FBSUwsb0JBQWdCLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QjtBQUM1QyxVQUFJLDZCQUFnQixJQUFoQixDQUFKLEVBQTJCO0FBQ3pCLHdCQUFnQixPQUFoQixFQUF5QixJQUF6QixFQUErQixLQUFLLFNBQUwsQ0FBZSxDQUFmLEVBQWtCLEtBQWpEO0FBQ0Q7QUFDRjtBQVJJLEdBQVA7QUFVRCxDQVhEIiwiZmlsZSI6InJ1bGVzL25vLW5vZGVqcy1tb2R1bGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGltcG9ydFR5cGUgZnJvbSAnLi4vY29yZS9pbXBvcnRUeXBlJ1xuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXG5cbmZ1bmN0aW9uIHJlcG9ydElmTWlzc2luZyhjb250ZXh0LCBub2RlLCBuYW1lKSB7XG4gIGlmIChpbXBvcnRUeXBlKG5hbWUsIGNvbnRleHQpID09PSAnYnVpbHRpbicpIHtcbiAgICBjb250ZXh0LnJlcG9ydChub2RlLCAnRG8gbm90IGltcG9ydCBOb2RlLmpzIGJ1aWx0aW4gbW9kdWxlIFwiJyArIG5hbWUgKyAnXCInKVxuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgcmV0dXJuIHtcbiAgICBJbXBvcnREZWNsYXJhdGlvbjogZnVuY3Rpb24gaGFuZGxlSW1wb3J0cyhub2RlKSB7XG4gICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgbm9kZSwgbm9kZS5zb3VyY2UudmFsdWUpXG4gICAgfSxcbiAgICBDYWxsRXhwcmVzc2lvbjogZnVuY3Rpb24gaGFuZGxlUmVxdWlyZXMobm9kZSkge1xuICAgICAgaWYgKGlzU3RhdGljUmVxdWlyZShub2RlKSkge1xuICAgICAgICByZXBvcnRJZk1pc3NpbmcoY29udGV4dCwgbm9kZSwgbm9kZS5hcmd1bWVudHNbMF0udmFsdWUpXG4gICAgICB9XG4gICAgfSxcbiAgfVxufVxuIl19