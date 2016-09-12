'use strict';

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _resolve = require('../core/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function checkImports(imported, context) {
  imported.forEach(function (nodes, module) {
    if (nodes.size > 1) {
      nodes.forEach(function (node) {
        context.report(node, '\'' + module + '\' imported multiple times.');
      });
    }
  });
}

module.exports = function (context) {
  var imported = new _es6Map2.default();
  var typesImported = new _es6Map2.default();
  return {
    'ImportDeclaration': function ImportDeclaration(n) {
      // resolved path will cover aliased duplicates
      var resolvedPath = (0, _resolve2.default)(n.source.value, context) || n.source.value;
      var importMap = n.importKind === 'type' ? typesImported : imported;

      if (importMap.has(resolvedPath)) {
        importMap.get(resolvedPath).add(n.source);
      } else {
        importMap.set(resolvedPath, new _es6Set2.default([n.source]));
      }
    },

    'Program:exit': function ProgramExit() {
      checkImports(imported, context);
      checkImports(typesImported, context);
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWR1cGxpY2F0ZXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBRUE7Ozs7OztBQUVBLFNBQVMsWUFBVCxDQUFzQixRQUF0QixFQUFnQyxPQUFoQyxFQUF5QztBQUN2QyxXQUFTLE9BQVQsQ0FBaUIsVUFBQyxLQUFELEVBQVEsTUFBUixFQUFtQjtBQUNsQyxRQUFJLE1BQU0sSUFBTixHQUFhLENBQWpCLEVBQW9CO0FBQ2xCLFlBQU0sT0FBTixDQUFjLFVBQUMsSUFBRCxFQUFVO0FBQ3RCLGdCQUFRLE1BQVIsQ0FBZSxJQUFmLFNBQXlCLE1BQXpCO0FBQ0QsT0FGRDtBQUdEO0FBQ0YsR0FORDtBQU9EOztBQUVELE9BQU8sT0FBUCxHQUFpQixVQUFVLE9BQVYsRUFBbUI7QUFDbEMsTUFBTSxXQUFXLHNCQUFqQjtBQUNBLE1BQU0sZ0JBQWdCLHNCQUF0QjtBQUNBLFNBQU87QUFDTCx5QkFBcUIsMkJBQVUsQ0FBVixFQUFhO0FBQ2hDO0FBQ0EsVUFBTSxlQUFlLHVCQUFRLEVBQUUsTUFBRixDQUFTLEtBQWpCLEVBQXdCLE9BQXhCLEtBQW9DLEVBQUUsTUFBRixDQUFTLEtBQWxFO0FBQ0EsVUFBTSxZQUFZLEVBQUUsVUFBRixLQUFpQixNQUFqQixHQUEwQixhQUExQixHQUEwQyxRQUE1RDs7QUFFQSxVQUFJLFVBQVUsR0FBVixDQUFjLFlBQWQsQ0FBSixFQUFpQztBQUMvQixrQkFBVSxHQUFWLENBQWMsWUFBZCxFQUE0QixHQUE1QixDQUFnQyxFQUFFLE1BQWxDO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsa0JBQVUsR0FBVixDQUFjLFlBQWQsRUFBNEIscUJBQVEsQ0FBQyxFQUFFLE1BQUgsQ0FBUixDQUE1QjtBQUNEO0FBQ0YsS0FYSTs7QUFhTCxvQkFBZ0IsdUJBQVk7QUFDMUIsbUJBQWEsUUFBYixFQUF1QixPQUF2QjtBQUNBLG1CQUFhLGFBQWIsRUFBNEIsT0FBNUI7QUFDRDtBQWhCSSxHQUFQO0FBa0JELENBckJEIiwiZmlsZSI6InJ1bGVzL25vLWR1cGxpY2F0ZXMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTWFwIGZyb20gJ2VzNi1tYXAnXG5pbXBvcnQgU2V0IGZyb20gJ2VzNi1zZXQnXG5cbmltcG9ydCByZXNvbHZlIGZyb20gJy4uL2NvcmUvcmVzb2x2ZSdcblxuZnVuY3Rpb24gY2hlY2tJbXBvcnRzKGltcG9ydGVkLCBjb250ZXh0KSB7XG4gIGltcG9ydGVkLmZvckVhY2goKG5vZGVzLCBtb2R1bGUpID0+IHtcbiAgICBpZiAobm9kZXMuc2l6ZSA+IDEpIHtcbiAgICAgIG5vZGVzLmZvckVhY2goKG5vZGUpID0+IHtcbiAgICAgICAgY29udGV4dC5yZXBvcnQobm9kZSwgYCcke21vZHVsZX0nIGltcG9ydGVkIG11bHRpcGxlIHRpbWVzLmApXG4gICAgICB9KVxuICAgIH1cbiAgfSlcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCBpbXBvcnRlZCA9IG5ldyBNYXAoKVxuICBjb25zdCB0eXBlc0ltcG9ydGVkID0gbmV3IE1hcCgpXG4gIHJldHVybiB7XG4gICAgJ0ltcG9ydERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG4pIHtcbiAgICAgIC8vIHJlc29sdmVkIHBhdGggd2lsbCBjb3ZlciBhbGlhc2VkIGR1cGxpY2F0ZXNcbiAgICAgIGNvbnN0IHJlc29sdmVkUGF0aCA9IHJlc29sdmUobi5zb3VyY2UudmFsdWUsIGNvbnRleHQpIHx8IG4uc291cmNlLnZhbHVlXG4gICAgICBjb25zdCBpbXBvcnRNYXAgPSBuLmltcG9ydEtpbmQgPT09ICd0eXBlJyA/IHR5cGVzSW1wb3J0ZWQgOiBpbXBvcnRlZFxuXG4gICAgICBpZiAoaW1wb3J0TWFwLmhhcyhyZXNvbHZlZFBhdGgpKSB7XG4gICAgICAgIGltcG9ydE1hcC5nZXQocmVzb2x2ZWRQYXRoKS5hZGQobi5zb3VyY2UpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbXBvcnRNYXAuc2V0KHJlc29sdmVkUGF0aCwgbmV3IFNldChbbi5zb3VyY2VdKSlcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgJ1Byb2dyYW06ZXhpdCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGNoZWNrSW1wb3J0cyhpbXBvcnRlZCwgY29udGV4dClcbiAgICAgIGNoZWNrSW1wb3J0cyh0eXBlc0ltcG9ydGVkLCBjb250ZXh0KVxuICAgIH0sXG4gIH1cbn1cbiJdfQ==