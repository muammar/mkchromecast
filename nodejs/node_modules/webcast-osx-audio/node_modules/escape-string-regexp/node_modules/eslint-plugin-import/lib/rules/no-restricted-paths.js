'use strict';

var _containsPath = require('contains-path');

var _containsPath2 = _interopRequireDefault(_containsPath);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _resolve = require('../core/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

var _staticRequire = require('../core/staticRequire');

var _staticRequire2 = _interopRequireDefault(_staticRequire);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function noRestrictedPaths(context) {
  var options = context.options[0] || {};
  var restrictedPaths = options.zones || [];
  var basePath = options.basePath || process.cwd();
  var currentFilename = context.getFilename();
  var matchingZones = restrictedPaths.filter(function (zone) {
    var targetPath = _path2.default.resolve(basePath, zone.target);

    return (0, _containsPath2.default)(currentFilename, targetPath);
  });

  function checkForRestrictedImportPath(importPath, node) {
    var absoluteImportPath = (0, _resolve2.default)(importPath, context);

    if (!absoluteImportPath) {
      return;
    }

    matchingZones.forEach(function (zone) {
      var absoluteFrom = _path2.default.resolve(basePath, zone.from);

      if ((0, _containsPath2.default)(absoluteImportPath, absoluteFrom)) {
        context.report({
          node: node,
          message: 'Unexpected path "' + importPath + '" imported in restricted zone.'
        });
      }
    });
  }

  return {
    ImportDeclaration: function ImportDeclaration(node) {
      checkForRestrictedImportPath(node.source.value, node.source);
    },
    CallExpression: function CallExpression(node) {
      if ((0, _staticRequire2.default)(node)) {
        var _node$arguments = node.arguments;
        var firstArgument = _node$arguments[0];


        checkForRestrictedImportPath(firstArgument.value, firstArgument);
      }
    }
  };
};

module.exports.schema = [{
  type: 'object',
  properties: {
    zones: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'object',
        properties: {
          target: { type: 'string' },
          from: { type: 'string' }
        },
        additionalProperties: false
      }
    },
    basePath: { type: 'string' }
  },
  additionalProperties: false
}];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLXJlc3RyaWN0ZWQtcGF0aHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7OztBQUNBOzs7O0FBRUE7Ozs7QUFDQTs7Ozs7O0FBRUEsT0FBTyxPQUFQLEdBQWlCLFNBQVMsaUJBQVQsQ0FBMkIsT0FBM0IsRUFBb0M7QUFDbkQsTUFBTSxVQUFVLFFBQVEsT0FBUixDQUFnQixDQUFoQixLQUFzQixFQUF0QztBQUNBLE1BQU0sa0JBQWtCLFFBQVEsS0FBUixJQUFpQixFQUF6QztBQUNBLE1BQU0sV0FBVyxRQUFRLFFBQVIsSUFBb0IsUUFBUSxHQUFSLEVBQXJDO0FBQ0EsTUFBTSxrQkFBa0IsUUFBUSxXQUFSLEVBQXhCO0FBQ0EsTUFBTSxnQkFBZ0IsZ0JBQWdCLE1BQWhCLENBQXVCLFVBQUMsSUFBRCxFQUFVO0FBQ3JELFFBQU0sYUFBYSxlQUFLLE9BQUwsQ0FBYSxRQUFiLEVBQXVCLEtBQUssTUFBNUIsQ0FBbkI7O0FBRUEsV0FBTyw0QkFBYSxlQUFiLEVBQThCLFVBQTlCLENBQVA7QUFDRCxHQUpxQixDQUF0Qjs7QUFNQSxXQUFTLDRCQUFULENBQXNDLFVBQXRDLEVBQWtELElBQWxELEVBQXdEO0FBQ3BELFFBQU0scUJBQXFCLHVCQUFRLFVBQVIsRUFBb0IsT0FBcEIsQ0FBM0I7O0FBRUEsUUFBSSxDQUFDLGtCQUFMLEVBQXlCO0FBQ3ZCO0FBQ0Q7O0FBRUQsa0JBQWMsT0FBZCxDQUFzQixVQUFDLElBQUQsRUFBVTtBQUM5QixVQUFNLGVBQWUsZUFBSyxPQUFMLENBQWEsUUFBYixFQUF1QixLQUFLLElBQTVCLENBQXJCOztBQUVBLFVBQUksNEJBQWEsa0JBQWIsRUFBaUMsWUFBakMsQ0FBSixFQUFvRDtBQUNsRCxnQkFBUSxNQUFSLENBQWU7QUFDYixvQkFEYTtBQUViLHlDQUE2QixVQUE3QjtBQUZhLFNBQWY7QUFJRDtBQUNGLEtBVEQ7QUFVSDs7QUFFRCxTQUFPO0FBQ0wscUJBREssNkJBQ2EsSUFEYixFQUNtQjtBQUN0QixtQ0FBNkIsS0FBSyxNQUFMLENBQVksS0FBekMsRUFBZ0QsS0FBSyxNQUFyRDtBQUNELEtBSEk7QUFJTCxrQkFKSywwQkFJVSxJQUpWLEVBSWdCO0FBQ25CLFVBQUksNkJBQWdCLElBQWhCLENBQUosRUFBMkI7QUFBQSw4QkFDQyxLQUFLLFNBRE47QUFBQSxZQUNqQixhQURpQjs7O0FBR3pCLHFDQUE2QixjQUFjLEtBQTNDLEVBQWtELGFBQWxEO0FBQ0Q7QUFDRjtBQVZJLEdBQVA7QUFZRCxDQTFDRDs7QUE0Q0EsT0FBTyxPQUFQLENBQWUsTUFBZixHQUF3QixDQUN0QjtBQUNFLFFBQU0sUUFEUjtBQUVFLGNBQVk7QUFDVixXQUFPO0FBQ0wsWUFBTSxPQUREO0FBRUwsZ0JBQVUsQ0FGTDtBQUdMLGFBQU87QUFDTCxjQUFNLFFBREQ7QUFFTCxvQkFBWTtBQUNWLGtCQUFRLEVBQUUsTUFBTSxRQUFSLEVBREU7QUFFVixnQkFBTSxFQUFFLE1BQU0sUUFBUjtBQUZJLFNBRlA7QUFNTCw4QkFBc0I7QUFOakI7QUFIRixLQURHO0FBYVYsY0FBVSxFQUFFLE1BQU0sUUFBUjtBQWJBLEdBRmQ7QUFpQkUsd0JBQXNCO0FBakJ4QixDQURzQixDQUF4QiIsImZpbGUiOiJydWxlcy9uby1yZXN0cmljdGVkLXBhdGhzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGNvbnRhaW5zUGF0aCBmcm9tICdjb250YWlucy1wYXRoJ1xuaW1wb3J0IHBhdGggZnJvbSAncGF0aCdcblxuaW1wb3J0IHJlc29sdmUgZnJvbSAnLi4vY29yZS9yZXNvbHZlJ1xuaW1wb3J0IGlzU3RhdGljUmVxdWlyZSBmcm9tICcuLi9jb3JlL3N0YXRpY1JlcXVpcmUnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbm9SZXN0cmljdGVkUGF0aHMoY29udGV4dCkge1xuICBjb25zdCBvcHRpb25zID0gY29udGV4dC5vcHRpb25zWzBdIHx8IHt9XG4gIGNvbnN0IHJlc3RyaWN0ZWRQYXRocyA9IG9wdGlvbnMuem9uZXMgfHwgW11cbiAgY29uc3QgYmFzZVBhdGggPSBvcHRpb25zLmJhc2VQYXRoIHx8IHByb2Nlc3MuY3dkKClcbiAgY29uc3QgY3VycmVudEZpbGVuYW1lID0gY29udGV4dC5nZXRGaWxlbmFtZSgpXG4gIGNvbnN0IG1hdGNoaW5nWm9uZXMgPSByZXN0cmljdGVkUGF0aHMuZmlsdGVyKCh6b25lKSA9PiB7XG4gICAgY29uc3QgdGFyZ2V0UGF0aCA9IHBhdGgucmVzb2x2ZShiYXNlUGF0aCwgem9uZS50YXJnZXQpXG5cbiAgICByZXR1cm4gY29udGFpbnNQYXRoKGN1cnJlbnRGaWxlbmFtZSwgdGFyZ2V0UGF0aClcbiAgfSlcblxuICBmdW5jdGlvbiBjaGVja0ZvclJlc3RyaWN0ZWRJbXBvcnRQYXRoKGltcG9ydFBhdGgsIG5vZGUpIHtcbiAgICAgIGNvbnN0IGFic29sdXRlSW1wb3J0UGF0aCA9IHJlc29sdmUoaW1wb3J0UGF0aCwgY29udGV4dClcblxuICAgICAgaWYgKCFhYnNvbHV0ZUltcG9ydFBhdGgpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG5cbiAgICAgIG1hdGNoaW5nWm9uZXMuZm9yRWFjaCgoem9uZSkgPT4ge1xuICAgICAgICBjb25zdCBhYnNvbHV0ZUZyb20gPSBwYXRoLnJlc29sdmUoYmFzZVBhdGgsIHpvbmUuZnJvbSlcblxuICAgICAgICBpZiAoY29udGFpbnNQYXRoKGFic29sdXRlSW1wb3J0UGF0aCwgYWJzb2x1dGVGcm9tKSkge1xuICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgIG5vZGUsXG4gICAgICAgICAgICBtZXNzYWdlOiBgVW5leHBlY3RlZCBwYXRoIFwiJHtpbXBvcnRQYXRofVwiIGltcG9ydGVkIGluIHJlc3RyaWN0ZWQgem9uZS5gLFxuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0pXG4gIH1cblxuICByZXR1cm4ge1xuICAgIEltcG9ydERlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICAgIGNoZWNrRm9yUmVzdHJpY3RlZEltcG9ydFBhdGgobm9kZS5zb3VyY2UudmFsdWUsIG5vZGUuc291cmNlKVxuICAgIH0sXG4gICAgQ2FsbEV4cHJlc3Npb24obm9kZSkge1xuICAgICAgaWYgKGlzU3RhdGljUmVxdWlyZShub2RlKSkge1xuICAgICAgICBjb25zdCBbIGZpcnN0QXJndW1lbnQgXSA9IG5vZGUuYXJndW1lbnRzXG5cbiAgICAgICAgY2hlY2tGb3JSZXN0cmljdGVkSW1wb3J0UGF0aChmaXJzdEFyZ3VtZW50LnZhbHVlLCBmaXJzdEFyZ3VtZW50KVxuICAgICAgfVxuICAgIH0sXG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMuc2NoZW1hID0gW1xuICB7XG4gICAgdHlwZTogJ29iamVjdCcsXG4gICAgcHJvcGVydGllczoge1xuICAgICAgem9uZXM6IHtcbiAgICAgICAgdHlwZTogJ2FycmF5JyxcbiAgICAgICAgbWluSXRlbXM6IDEsXG4gICAgICAgIGl0ZW1zOiB7XG4gICAgICAgICAgdHlwZTogJ29iamVjdCcsXG4gICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgdGFyZ2V0OiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICAgICAgICBmcm9tOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG4gICAgICAgICAgfSxcbiAgICAgICAgICBhZGRpdGlvbmFsUHJvcGVydGllczogZmFsc2UsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAgYmFzZVBhdGg6IHsgdHlwZTogJ3N0cmluZycgfSxcbiAgICB9LFxuICAgIGFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBmYWxzZSxcbiAgfSxcbl1cbiJdfQ==