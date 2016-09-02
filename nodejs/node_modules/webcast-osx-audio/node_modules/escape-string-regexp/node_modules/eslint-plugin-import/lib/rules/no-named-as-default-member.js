'use strict';

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

var _importDeclaration = require('../importDeclaration');

var _importDeclaration2 = _interopRequireDefault(_importDeclaration);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

  var fileImports = new _es6Map2.default();
  var allPropertyLookups = new _es6Map2.default();

  function handleImportDefault(node) {
    var declaration = (0, _importDeclaration2.default)(context);
    var exportMap = _getExports2.default.get(declaration.source.value, context);
    if (exportMap == null) return;

    if (exportMap.errors.length) {
      exportMap.reportErrors(context, declaration);
      return;
    }

    fileImports.set(node.local.name, {
      exportMap: exportMap,
      sourcePath: declaration.source.value
    });
  }

  function storePropertyLookup(objectName, propName, node) {
    var lookups = allPropertyLookups.get(objectName) || [];
    lookups.push({ node: node, propName: propName });
    allPropertyLookups.set(objectName, lookups);
  }

  function handlePropLookup(node) {
    var objectName = node.object.name;
    var propName = node.property.name;
    storePropertyLookup(objectName, propName, node);
  }

  function handleDestructuringAssignment(node) {
    var isDestructure = node.id.type === 'ObjectPattern' && node.init != null && node.init.type === 'Identifier';
    if (!isDestructure) return;

    var objectName = node.init.name;
    node.id.properties.forEach(function (_ref) {
      var key = _ref.key;

      if (key != null) {
        // rest properties are null
        storePropertyLookup(objectName, key.name, key);
      }
    });
  }

  function handleProgramExit() {
    allPropertyLookups.forEach(function (lookups, objectName) {
      var fileImport = fileImports.get(objectName);
      if (fileImport == null) return;

      lookups.forEach(function (_ref2) {
        var propName = _ref2.propName;
        var node = _ref2.node;

        if (fileImport.exportMap.namespace.has(propName)) {
          context.report({
            node: node,
            message: 'Caution: `' + objectName + '` also has a named export ' + ('`' + propName + '`. Check if you meant to write ') + ('`import {' + propName + '} from \'' + fileImport.sourcePath + '\'` ') + 'instead.'
          });
        }
      });
    });
  }

  return {
    'ImportDefaultSpecifier': handleImportDefault,
    'MemberExpression': handlePropLookup,
    'VariableDeclarator': handleDestructuringAssignment,
    'Program:exit': handleProgramExit
  };
}; /**
    * @fileoverview Rule to warn about potentially confused use of name exports
    * @author Desmond Brand
    * @copyright 2016 Desmond Brand. All rights reserved.
    * See LICENSE in root directory for full license.
    */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBT0E7Ozs7QUFFQTs7OztBQUNBOzs7Ozs7QUFFQTtBQUNBO0FBQ0E7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFVBQVMsT0FBVCxFQUFrQjs7QUFFakMsTUFBTSxjQUFjLHNCQUFwQjtBQUNBLE1BQU0scUJBQXFCLHNCQUEzQjs7QUFFQSxXQUFTLG1CQUFULENBQTZCLElBQTdCLEVBQW1DO0FBQ2pDLFFBQU0sY0FBYyxpQ0FBa0IsT0FBbEIsQ0FBcEI7QUFDQSxRQUFNLFlBQVkscUJBQVEsR0FBUixDQUFZLFlBQVksTUFBWixDQUFtQixLQUEvQixFQUFzQyxPQUF0QyxDQUFsQjtBQUNBLFFBQUksYUFBYSxJQUFqQixFQUF1Qjs7QUFFdkIsUUFBSSxVQUFVLE1BQVYsQ0FBaUIsTUFBckIsRUFBNkI7QUFDM0IsZ0JBQVUsWUFBVixDQUF1QixPQUF2QixFQUFnQyxXQUFoQztBQUNBO0FBQ0Q7O0FBRUQsZ0JBQVksR0FBWixDQUFnQixLQUFLLEtBQUwsQ0FBVyxJQUEzQixFQUFpQztBQUMvQiwwQkFEK0I7QUFFL0Isa0JBQVksWUFBWSxNQUFaLENBQW1CO0FBRkEsS0FBakM7QUFJRDs7QUFFRCxXQUFTLG1CQUFULENBQTZCLFVBQTdCLEVBQXlDLFFBQXpDLEVBQW1ELElBQW5ELEVBQXlEO0FBQ3ZELFFBQU0sVUFBVSxtQkFBbUIsR0FBbkIsQ0FBdUIsVUFBdkIsS0FBc0MsRUFBdEQ7QUFDQSxZQUFRLElBQVIsQ0FBYSxFQUFDLFVBQUQsRUFBTyxrQkFBUCxFQUFiO0FBQ0EsdUJBQW1CLEdBQW5CLENBQXVCLFVBQXZCLEVBQW1DLE9BQW5DO0FBQ0Q7O0FBRUQsV0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUFnQztBQUM5QixRQUFNLGFBQWEsS0FBSyxNQUFMLENBQVksSUFBL0I7QUFDQSxRQUFNLFdBQVcsS0FBSyxRQUFMLENBQWMsSUFBL0I7QUFDQSx3QkFBb0IsVUFBcEIsRUFBZ0MsUUFBaEMsRUFBMEMsSUFBMUM7QUFDRDs7QUFFRCxXQUFTLDZCQUFULENBQXVDLElBQXZDLEVBQTZDO0FBQzNDLFFBQU0sZ0JBQ0osS0FBSyxFQUFMLENBQVEsSUFBUixLQUFpQixlQUFqQixJQUNBLEtBQUssSUFBTCxJQUFhLElBRGIsSUFFQSxLQUFLLElBQUwsQ0FBVSxJQUFWLEtBQW1CLFlBSHJCO0FBS0EsUUFBSSxDQUFDLGFBQUwsRUFBb0I7O0FBRXBCLFFBQU0sYUFBYSxLQUFLLElBQUwsQ0FBVSxJQUE3QjtBQUNBLFNBQUssRUFBTCxDQUFRLFVBQVIsQ0FBbUIsT0FBbkIsQ0FBMkIsZ0JBQVc7QUFBQSxVQUFULEdBQVMsUUFBVCxHQUFTOztBQUNwQyxVQUFJLE9BQU8sSUFBWCxFQUFpQjtBQUFFO0FBQ2pCLDRCQUFvQixVQUFwQixFQUFnQyxJQUFJLElBQXBDLEVBQTBDLEdBQTFDO0FBQ0Q7QUFDRixLQUpEO0FBS0Q7O0FBRUQsV0FBUyxpQkFBVCxHQUE2QjtBQUMzQix1QkFBbUIsT0FBbkIsQ0FBMkIsVUFBQyxPQUFELEVBQVUsVUFBVixFQUF5QjtBQUNsRCxVQUFNLGFBQWEsWUFBWSxHQUFaLENBQWdCLFVBQWhCLENBQW5CO0FBQ0EsVUFBSSxjQUFjLElBQWxCLEVBQXdCOztBQUV4QixjQUFRLE9BQVIsQ0FBZ0IsaUJBQXNCO0FBQUEsWUFBcEIsUUFBb0IsU0FBcEIsUUFBb0I7QUFBQSxZQUFWLElBQVUsU0FBVixJQUFVOztBQUNwQyxZQUFJLFdBQVcsU0FBWCxDQUFxQixTQUFyQixDQUErQixHQUEvQixDQUFtQyxRQUFuQyxDQUFKLEVBQWtEO0FBQ2hELGtCQUFRLE1BQVIsQ0FBZTtBQUNiLHNCQURhO0FBRWIscUJBQ0UsZUFBYyxVQUFkLHlDQUNLLFFBREwsdURBRWEsUUFGYixpQkFFZ0MsV0FBVyxVQUYzQyxhQUdBO0FBTlcsV0FBZjtBQVNEO0FBQ0YsT0FaRDtBQWFELEtBakJEO0FBa0JEOztBQUVELFNBQU87QUFDTCw4QkFBMEIsbUJBRHJCO0FBRUwsd0JBQW9CLGdCQUZmO0FBR0wsMEJBQXNCLDZCQUhqQjtBQUlMLG9CQUFnQjtBQUpYLEdBQVA7QUFNRCxDQTVFRCxDLENBaEJBIiwiZmlsZSI6InJ1bGVzL25vLW5hbWVkLWFzLWRlZmF1bHQtbWVtYmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gd2FybiBhYm91dCBwb3RlbnRpYWxseSBjb25mdXNlZCB1c2Ugb2YgbmFtZSBleHBvcnRzXG4gKiBAYXV0aG9yIERlc21vbmQgQnJhbmRcbiAqIEBjb3B5cmlnaHQgMjAxNiBEZXNtb25kIEJyYW5kLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICogU2VlIExJQ0VOU0UgaW4gcm9vdCBkaXJlY3RvcnkgZm9yIGZ1bGwgbGljZW5zZS5cbiAqL1xuXG5pbXBvcnQgTWFwIGZyb20gJ2VzNi1tYXAnXG5cbmltcG9ydCBFeHBvcnRzIGZyb20gJy4uL2NvcmUvZ2V0RXhwb3J0cydcbmltcG9ydCBpbXBvcnREZWNsYXJhdGlvbiBmcm9tICcuLi9pbXBvcnREZWNsYXJhdGlvbidcblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbi8vIFJ1bGUgRGVmaW5pdGlvblxuLy8tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG5cbiAgY29uc3QgZmlsZUltcG9ydHMgPSBuZXcgTWFwKClcbiAgY29uc3QgYWxsUHJvcGVydHlMb29rdXBzID0gbmV3IE1hcCgpXG5cbiAgZnVuY3Rpb24gaGFuZGxlSW1wb3J0RGVmYXVsdChub2RlKSB7XG4gICAgY29uc3QgZGVjbGFyYXRpb24gPSBpbXBvcnREZWNsYXJhdGlvbihjb250ZXh0KVxuICAgIGNvbnN0IGV4cG9ydE1hcCA9IEV4cG9ydHMuZ2V0KGRlY2xhcmF0aW9uLnNvdXJjZS52YWx1ZSwgY29udGV4dClcbiAgICBpZiAoZXhwb3J0TWFwID09IG51bGwpIHJldHVyblxuXG4gICAgaWYgKGV4cG9ydE1hcC5lcnJvcnMubGVuZ3RoKSB7XG4gICAgICBleHBvcnRNYXAucmVwb3J0RXJyb3JzKGNvbnRleHQsIGRlY2xhcmF0aW9uKVxuICAgICAgcmV0dXJuXG4gICAgfVxuXG4gICAgZmlsZUltcG9ydHMuc2V0KG5vZGUubG9jYWwubmFtZSwge1xuICAgICAgZXhwb3J0TWFwLFxuICAgICAgc291cmNlUGF0aDogZGVjbGFyYXRpb24uc291cmNlLnZhbHVlLFxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBzdG9yZVByb3BlcnR5TG9va3VwKG9iamVjdE5hbWUsIHByb3BOYW1lLCBub2RlKSB7XG4gICAgY29uc3QgbG9va3VwcyA9IGFsbFByb3BlcnR5TG9va3Vwcy5nZXQob2JqZWN0TmFtZSkgfHwgW11cbiAgICBsb29rdXBzLnB1c2goe25vZGUsIHByb3BOYW1lfSlcbiAgICBhbGxQcm9wZXJ0eUxvb2t1cHMuc2V0KG9iamVjdE5hbWUsIGxvb2t1cHMpXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQcm9wTG9va3VwKG5vZGUpIHtcbiAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5vYmplY3QubmFtZVxuICAgIGNvbnN0IHByb3BOYW1lID0gbm9kZS5wcm9wZXJ0eS5uYW1lXG4gICAgc3RvcmVQcm9wZXJ0eUxvb2t1cChvYmplY3ROYW1lLCBwcm9wTmFtZSwgbm9kZSlcbiAgfVxuXG4gIGZ1bmN0aW9uIGhhbmRsZURlc3RydWN0dXJpbmdBc3NpZ25tZW50KG5vZGUpIHtcbiAgICBjb25zdCBpc0Rlc3RydWN0dXJlID0gKFxuICAgICAgbm9kZS5pZC50eXBlID09PSAnT2JqZWN0UGF0dGVybicgJiZcbiAgICAgIG5vZGUuaW5pdCAhPSBudWxsICYmXG4gICAgICBub2RlLmluaXQudHlwZSA9PT0gJ0lkZW50aWZpZXInXG4gICAgKVxuICAgIGlmICghaXNEZXN0cnVjdHVyZSkgcmV0dXJuXG5cbiAgICBjb25zdCBvYmplY3ROYW1lID0gbm9kZS5pbml0Lm5hbWVcbiAgICBub2RlLmlkLnByb3BlcnRpZXMuZm9yRWFjaCgoe2tleX0pID0+IHtcbiAgICAgIGlmIChrZXkgIT0gbnVsbCkgeyAvLyByZXN0IHByb3BlcnRpZXMgYXJlIG51bGxcbiAgICAgICAgc3RvcmVQcm9wZXJ0eUxvb2t1cChvYmplY3ROYW1lLCBrZXkubmFtZSwga2V5KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVQcm9ncmFtRXhpdCgpIHtcbiAgICBhbGxQcm9wZXJ0eUxvb2t1cHMuZm9yRWFjaCgobG9va3Vwcywgb2JqZWN0TmFtZSkgPT4ge1xuICAgICAgY29uc3QgZmlsZUltcG9ydCA9IGZpbGVJbXBvcnRzLmdldChvYmplY3ROYW1lKVxuICAgICAgaWYgKGZpbGVJbXBvcnQgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgIGxvb2t1cHMuZm9yRWFjaCgoe3Byb3BOYW1lLCBub2RlfSkgPT4ge1xuICAgICAgICBpZiAoZmlsZUltcG9ydC5leHBvcnRNYXAubmFtZXNwYWNlLmhhcyhwcm9wTmFtZSkpIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7XG4gICAgICAgICAgICBub2RlLFxuICAgICAgICAgICAgbWVzc2FnZTogKFxuICAgICAgICAgICAgICBgQ2F1dGlvbjogXFxgJHtvYmplY3ROYW1lfVxcYCBhbHNvIGhhcyBhIG5hbWVkIGV4cG9ydCBgICtcbiAgICAgICAgICAgICAgYFxcYCR7cHJvcE5hbWV9XFxgLiBDaGVjayBpZiB5b3UgbWVhbnQgdG8gd3JpdGUgYCArXG4gICAgICAgICAgICAgIGBcXGBpbXBvcnQgeyR7cHJvcE5hbWV9fSBmcm9tICcke2ZpbGVJbXBvcnQuc291cmNlUGF0aH0nXFxgIGAgK1xuICAgICAgICAgICAgICAnaW5zdGVhZC4nXG4gICAgICAgICAgICApLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJ0ltcG9ydERlZmF1bHRTcGVjaWZpZXInOiBoYW5kbGVJbXBvcnREZWZhdWx0LFxuICAgICdNZW1iZXJFeHByZXNzaW9uJzogaGFuZGxlUHJvcExvb2t1cCxcbiAgICAnVmFyaWFibGVEZWNsYXJhdG9yJzogaGFuZGxlRGVzdHJ1Y3R1cmluZ0Fzc2lnbm1lbnQsXG4gICAgJ1Byb2dyYW06ZXhpdCc6IGhhbmRsZVByb2dyYW1FeGl0LFxuICB9XG59XG4iXX0=