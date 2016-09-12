'use strict';

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _es6Set = require('es6-set');

var _es6Set2 = _interopRequireDefault(_es6Set);

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var named = new _es6Map2.default();

  function addNamed(name, node) {
    var nodes = named.get(name);

    if (nodes == null) {
      nodes = new _es6Set2.default();
      named.set(name, nodes);
    }

    nodes.add(node);
  }

  return {
    'ExportDefaultDeclaration': function ExportDefaultDeclaration(node) {
      return addNamed('default', node);
    },

    'ExportSpecifier': function ExportSpecifier(node) {
      addNamed(node.exported.name, node.exported);
    },

    'ExportNamedDeclaration': function ExportNamedDeclaration(node) {
      if (node.declaration == null) return;

      if (node.declaration.id != null) {
        addNamed(node.declaration.id.name, node.declaration.id);
      }

      if (node.declaration.declarations == null) return;

      node.declaration.declarations.forEach(function (declaration) {
        (0, _getExports.recursivePatternCapture)(declaration.id, function (v) {
          return addNamed(v.name, v);
        });
      });
    },

    'ExportAllDeclaration': function ExportAllDeclaration(node) {
      if (node.source == null) return; // not sure if this is ever true

      var remoteExports = _getExports2.default.get(node.source.value, context);
      if (remoteExports == null) return;

      if (remoteExports.errors.length) {
        remoteExports.reportErrors(context, node);
        return;
      }
      var any = false;
      remoteExports.forEach(function (v, name) {
        return name !== 'default' && (any = true) && // poor man's filter
        addNamed(name, node);
      });

      if (!any) {
        context.report(node.source, 'No named exports found in module \'' + node.source.value + '\'.');
      }
    },

    'Program:exit': function ProgramExit() {
      named.forEach(function (nodes, name) {
        if (nodes.size <= 1) return;

        nodes.forEach(function (node) {
          if (name === 'default') {
            context.report(node, 'Multiple default exports.');
          } else context.report(node, 'Multiple exports of name \'' + name + '\'.');
        });
      });
    }
  };
};
//# sourceMappingURL=data:application/json;base64,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ImltcG9ydCBNYXAgZnJvbSAnZXM2LW1hcCdcbmltcG9ydCBTZXQgZnJvbSAnZXM2LXNldCdcblxuaW1wb3J0IEV4cG9ydE1hcCwgeyByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZSB9IGZyb20gJy4uL2NvcmUvZ2V0RXhwb3J0cydcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBjb25zdCBuYW1lZCA9IG5ldyBNYXAoKVxuXG4gIGZ1bmN0aW9uIGFkZE5hbWVkKG5hbWUsIG5vZGUpIHtcbiAgICBsZXQgbm9kZXMgPSBuYW1lZC5nZXQobmFtZSlcblxuICAgIGlmIChub2RlcyA9PSBudWxsKSB7XG4gICAgICBub2RlcyA9IG5ldyBTZXQoKVxuICAgICAgbmFtZWQuc2V0KG5hbWUsIG5vZGVzKVxuICAgIH1cblxuICAgIG5vZGVzLmFkZChub2RlKVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAnRXhwb3J0RGVmYXVsdERlY2xhcmF0aW9uJzogKG5vZGUpID0+IGFkZE5hbWVkKCdkZWZhdWx0Jywgbm9kZSksXG5cbiAgICAnRXhwb3J0U3BlY2lmaWVyJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGFkZE5hbWVkKG5vZGUuZXhwb3J0ZWQubmFtZSwgbm9kZS5leHBvcnRlZClcbiAgICB9LFxuXG4gICAgJ0V4cG9ydE5hbWVkRGVjbGFyYXRpb24nOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgaWYgKG5vZGUuZGVjbGFyYXRpb24gPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgIGlmIChub2RlLmRlY2xhcmF0aW9uLmlkICE9IG51bGwpIHtcbiAgICAgICAgYWRkTmFtZWQobm9kZS5kZWNsYXJhdGlvbi5pZC5uYW1lLCBub2RlLmRlY2xhcmF0aW9uLmlkKVxuICAgICAgfVxuXG4gICAgICBpZiAobm9kZS5kZWNsYXJhdGlvbi5kZWNsYXJhdGlvbnMgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICAgIG5vZGUuZGVjbGFyYXRpb24uZGVjbGFyYXRpb25zLmZvckVhY2goZGVjbGFyYXRpb24gPT4ge1xuICAgICAgICByZWN1cnNpdmVQYXR0ZXJuQ2FwdHVyZShkZWNsYXJhdGlvbi5pZCwgdiA9PiBhZGROYW1lZCh2Lm5hbWUsIHYpKVxuICAgICAgfSlcbiAgICB9LFxuXG4gICAgJ0V4cG9ydEFsbERlY2xhcmF0aW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChub2RlLnNvdXJjZSA9PSBudWxsKSByZXR1cm4gLy8gbm90IHN1cmUgaWYgdGhpcyBpcyBldmVyIHRydWVcblxuICAgICAgY29uc3QgcmVtb3RlRXhwb3J0cyA9IEV4cG9ydE1hcC5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXG4gICAgICBpZiAocmVtb3RlRXhwb3J0cyA9PSBudWxsKSByZXR1cm5cblxuICAgICAgaWYgKHJlbW90ZUV4cG9ydHMuZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICByZW1vdGVFeHBvcnRzLnJlcG9ydEVycm9ycyhjb250ZXh0LCBub2RlKVxuICAgICAgICByZXR1cm5cbiAgICAgIH1cbiAgICAgIGxldCBhbnkgPSBmYWxzZVxuICAgICAgcmVtb3RlRXhwb3J0cy5mb3JFYWNoKCh2LCBuYW1lKSA9PlxuICAgICAgICBuYW1lICE9PSAnZGVmYXVsdCcgJiZcbiAgICAgICAgKGFueSA9IHRydWUpICYmIC8vIHBvb3IgbWFuJ3MgZmlsdGVyXG4gICAgICAgIGFkZE5hbWVkKG5hbWUsIG5vZGUpKVxuXG4gICAgICBpZiAoIWFueSkge1xuICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLnNvdXJjZSxcbiAgICAgICAgICBgTm8gbmFtZWQgZXhwb3J0cyBmb3VuZCBpbiBtb2R1bGUgJyR7bm9kZS5zb3VyY2UudmFsdWV9Jy5gKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAnUHJvZ3JhbTpleGl0JzogZnVuY3Rpb24gKCkge1xuICAgICAgbmFtZWQuZm9yRWFjaCgobm9kZXMsIG5hbWUpID0+IHtcbiAgICAgICAgaWYgKG5vZGVzLnNpemUgPD0gMSkgcmV0dXJuXG5cbiAgICAgICAgbm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgICBpZiAobmFtZSA9PT0gJ2RlZmF1bHQnKSB7XG4gICAgICAgICAgICBjb250ZXh0LnJlcG9ydChub2RlLCAnTXVsdGlwbGUgZGVmYXVsdCBleHBvcnRzLicpXG4gICAgICAgICAgfSBlbHNlIGNvbnRleHQucmVwb3J0KG5vZGUsIGBNdWx0aXBsZSBleHBvcnRzIG9mIG5hbWUgJyR7bmFtZX0nLmApXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgIH0sXG4gIH1cbn1cbiJdfQ==