'use strict';

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {

  function checkDefault(specifierType, node) {

    // poor man's Array.find
    var defaultSpecifier = void 0;
    node.specifiers.some(function (n) {
      if (n.type === specifierType) {
        defaultSpecifier = n;
        return true;
      }
    });

    if (!defaultSpecifier) return;
    var imports = _getExports2.default.get(node.source.value, context);
    if (imports == null) return;

    if (imports.errors.length) {
      imports.reportErrors(context, node);
    } else if (!imports.get('default')) {
      context.report(defaultSpecifier, 'No default export found in module.');
    }
  }

  return {
    'ImportDeclaration': checkDefault.bind(null, 'ImportDefaultSpecifier'),
    'ExportNamedDeclaration': checkDefault.bind(null, 'ExportDefaultSpecifier')
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2RlZmF1bHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVUsT0FBVixFQUFtQjs7QUFFbEMsV0FBUyxZQUFULENBQXNCLGFBQXRCLEVBQXFDLElBQXJDLEVBQTJDOztBQUV6QztBQUNBLFFBQUkseUJBQUo7QUFDQSxTQUFLLFVBQUwsQ0FBZ0IsSUFBaEIsQ0FBcUIsVUFBQyxDQUFELEVBQU87QUFDMUIsVUFBSSxFQUFFLElBQUYsS0FBVyxhQUFmLEVBQThCO0FBQzVCLDJCQUFtQixDQUFuQjtBQUNBLGVBQU8sSUFBUDtBQUNEO0FBQ0YsS0FMRDs7QUFPQSxRQUFJLENBQUMsZ0JBQUwsRUFBdUI7QUFDdkIsUUFBSSxVQUFVLHFCQUFRLEdBQVIsQ0FBWSxLQUFLLE1BQUwsQ0FBWSxLQUF4QixFQUErQixPQUEvQixDQUFkO0FBQ0EsUUFBSSxXQUFXLElBQWYsRUFBcUI7O0FBRXJCLFFBQUksUUFBUSxNQUFSLENBQWUsTUFBbkIsRUFBMkI7QUFDekIsY0FBUSxZQUFSLENBQXFCLE9BQXJCLEVBQThCLElBQTlCO0FBQ0QsS0FGRCxNQUVPLElBQUksQ0FBQyxRQUFRLEdBQVIsQ0FBWSxTQUFaLENBQUwsRUFBNkI7QUFDbEMsY0FBUSxNQUFSLENBQWUsZ0JBQWYsRUFBaUMsb0NBQWpDO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPO0FBQ0wseUJBQXFCLGFBQWEsSUFBYixDQUFrQixJQUFsQixFQUF3Qix3QkFBeEIsQ0FEaEI7QUFFTCw4QkFBMEIsYUFBYSxJQUFiLENBQWtCLElBQWxCLEVBQXdCLHdCQUF4QjtBQUZyQixHQUFQO0FBSUQsQ0E1QkQiLCJmaWxlIjoicnVsZXMvZGVmYXVsdC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBFeHBvcnRzIGZyb20gJy4uL2NvcmUvZ2V0RXhwb3J0cydcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuXG4gIGZ1bmN0aW9uIGNoZWNrRGVmYXVsdChzcGVjaWZpZXJUeXBlLCBub2RlKSB7XG5cbiAgICAvLyBwb29yIG1hbidzIEFycmF5LmZpbmRcbiAgICBsZXQgZGVmYXVsdFNwZWNpZmllclxuICAgIG5vZGUuc3BlY2lmaWVycy5zb21lKChuKSA9PiB7XG4gICAgICBpZiAobi50eXBlID09PSBzcGVjaWZpZXJUeXBlKSB7XG4gICAgICAgIGRlZmF1bHRTcGVjaWZpZXIgPSBuXG4gICAgICAgIHJldHVybiB0cnVlXG4gICAgICB9XG4gICAgfSlcblxuICAgIGlmICghZGVmYXVsdFNwZWNpZmllcikgcmV0dXJuXG4gICAgdmFyIGltcG9ydHMgPSBFeHBvcnRzLmdldChub2RlLnNvdXJjZS52YWx1ZSwgY29udGV4dClcbiAgICBpZiAoaW1wb3J0cyA9PSBudWxsKSByZXR1cm5cblxuICAgIGlmIChpbXBvcnRzLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXG4gICAgfSBlbHNlIGlmICghaW1wb3J0cy5nZXQoJ2RlZmF1bHQnKSkge1xuICAgICAgY29udGV4dC5yZXBvcnQoZGVmYXVsdFNwZWNpZmllciwgJ05vIGRlZmF1bHQgZXhwb3J0IGZvdW5kIGluIG1vZHVsZS4nKVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJ0ltcG9ydERlY2xhcmF0aW9uJzogY2hlY2tEZWZhdWx0LmJpbmQobnVsbCwgJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInKSxcbiAgICAnRXhwb3J0TmFtZWREZWNsYXJhdGlvbic6IGNoZWNrRGVmYXVsdC5iaW5kKG51bGwsICdFeHBvcnREZWZhdWx0U3BlY2lmaWVyJyksXG4gIH1cbn1cbiJdfQ==