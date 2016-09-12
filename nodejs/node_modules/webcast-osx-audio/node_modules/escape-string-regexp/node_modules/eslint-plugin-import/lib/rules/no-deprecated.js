'use strict';

var _es6Map = require('es6-map');

var _es6Map2 = _interopRequireDefault(_es6Map);

var _getExports = require('../core/getExports');

var _getExports2 = _interopRequireDefault(_getExports);

var _declaredScope = require('../core/declaredScope');

var _declaredScope2 = _interopRequireDefault(_declaredScope);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = function (context) {
  var deprecated = new _es6Map2.default(),
      namespaces = new _es6Map2.default();

  function checkSpecifiers(node) {
    if (node.type !== 'ImportDeclaration') return;
    if (node.source == null) return; // local export, ignore

    var imports = _getExports2.default.get(node.source.value, context);
    if (imports == null) return;

    var moduleDeprecation = void 0;
    if (imports.doc && imports.doc.tags.some(function (t) {
      return t.title === 'deprecated' && (moduleDeprecation = t);
    })) {
      context.report({ node: node, message: message(moduleDeprecation) });
    }

    if (imports.errors.length) {
      imports.reportErrors(context, node);
      return;
    }

    node.specifiers.forEach(function (im) {
      var imported = void 0,
          local = void 0;
      switch (im.type) {

        case 'ImportNamespaceSpecifier':
          {
            if (!imports.size) return;
            namespaces.set(im.local.name, imports);
            return;
          }

        case 'ImportDefaultSpecifier':
          imported = 'default';
          local = im.local.name;
          break;

        case 'ImportSpecifier':
          imported = im.imported.name;
          local = im.local.name;
          break;

        default:
          return; // can't handle this one
      }

      // unknown thing can't be deprecated
      var exported = imports.get(imported);
      if (exported == null) return;

      // capture import of deep namespace
      if (exported.namespace) namespaces.set(local, exported.namespace);

      var deprecation = getDeprecation(imports.get(imported));
      if (!deprecation) return;

      context.report({ node: im, message: message(deprecation) });

      deprecated.set(local, deprecation);
    });
  }

  return {
    'Program': function Program(_ref) {
      var body = _ref.body;
      return body.forEach(checkSpecifiers);
    },

    'Identifier': function Identifier(node) {
      if (node.parent.type === 'MemberExpression' && node.parent.property === node) {
        return; // handled by MemberExpression
      }

      // ignore specifier identifiers
      if (node.parent.type.slice(0, 6) === 'Import') return;

      if (!deprecated.has(node.name)) return;

      if ((0, _declaredScope2.default)(context, node.name) !== 'module') return;
      context.report({
        node: node,
        message: message(deprecated.get(node.name))
      });
    },

    'MemberExpression': function MemberExpression(dereference) {
      if (dereference.object.type !== 'Identifier') return;
      if (!namespaces.has(dereference.object.name)) return;

      if ((0, _declaredScope2.default)(context, dereference.object.name) !== 'module') return;

      // go deep
      var namespace = namespaces.get(dereference.object.name);
      var namepath = [dereference.object.name];
      // while property is namespace and parent is member expression, keep validating
      while (namespace instanceof _getExports2.default && dereference.type === 'MemberExpression') {

        // ignore computed parts for now
        if (dereference.computed) return;

        var metadata = namespace.get(dereference.property.name);

        if (!metadata) break;
        var deprecation = getDeprecation(metadata);

        if (deprecation) {
          context.report({ node: dereference.property, message: message(deprecation) });
        }

        // stash and pop
        namepath.push(dereference.property.name);
        namespace = metadata.namespace;
        dereference = dereference.parent;
      }
    }
  };
};

function message(deprecation) {
  return 'Deprecated' + (deprecation.description ? ': ' + deprecation.description : '.');
}

function getDeprecation(metadata) {
  if (!metadata || !metadata.doc) return;

  var deprecation = void 0;
  if (metadata.doc.tags.some(function (t) {
    return t.title === 'deprecated' && (deprecation = t);
  })) {
    return deprecation;
  }
}
//# sourceMappingURL=data:application/json;base64,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U0FBckI7QUFDQSxzQkFBYyxZQUFZLE1BQTFCO0FBQ0Q7QUFDRjtBQWxESSxHQUFQO0FBb0RELENBbkhEOztBQXFIQSxTQUFTLE9BQVQsQ0FBaUIsV0FBakIsRUFBOEI7QUFDNUIsU0FBTyxnQkFBZ0IsWUFBWSxXQUFaLEdBQTBCLE9BQU8sWUFBWSxXQUE3QyxHQUEyRCxHQUEzRSxDQUFQO0FBQ0Q7O0FBRUQsU0FBUyxjQUFULENBQXdCLFFBQXhCLEVBQWtDO0FBQ2hDLE1BQUksQ0FBQyxRQUFELElBQWEsQ0FBQyxTQUFTLEdBQTNCLEVBQWdDOztBQUVoQyxNQUFJLG9CQUFKO0FBQ0EsTUFBSSxTQUFTLEdBQVQsQ0FBYSxJQUFiLENBQWtCLElBQWxCLENBQXVCO0FBQUEsV0FBSyxFQUFFLEtBQUYsS0FBWSxZQUFaLEtBQTZCLGNBQWMsQ0FBM0MsQ0FBTDtBQUFBLEdBQXZCLENBQUosRUFBZ0Y7QUFDOUUsV0FBTyxXQUFQO0FBQ0Q7QUFDRiIsImZpbGUiOiJydWxlcy9uby1kZXByZWNhdGVkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hcCBmcm9tICdlczYtbWFwJ1xuXG5pbXBvcnQgRXhwb3J0cyBmcm9tICcuLi9jb3JlL2dldEV4cG9ydHMnXG5pbXBvcnQgZGVjbGFyZWRTY29wZSBmcm9tICcuLi9jb3JlL2RlY2xhcmVkU2NvcGUnXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgY29uc3QgZGVwcmVjYXRlZCA9IG5ldyBNYXAoKVxuICAgICAgLCBuYW1lc3BhY2VzID0gbmV3IE1hcCgpXG5cbiAgZnVuY3Rpb24gY2hlY2tTcGVjaWZpZXJzKG5vZGUpIHtcbiAgICBpZiAobm9kZS50eXBlICE9PSAnSW1wb3J0RGVjbGFyYXRpb24nKSByZXR1cm5cbiAgICBpZiAobm9kZS5zb3VyY2UgPT0gbnVsbCkgcmV0dXJuIC8vIGxvY2FsIGV4cG9ydCwgaWdub3JlXG5cbiAgICBjb25zdCBpbXBvcnRzID0gRXhwb3J0cy5nZXQobm9kZS5zb3VyY2UudmFsdWUsIGNvbnRleHQpXG4gICAgaWYgKGltcG9ydHMgPT0gbnVsbCkgcmV0dXJuXG5cbiAgICBsZXQgbW9kdWxlRGVwcmVjYXRpb25cbiAgICBpZiAoaW1wb3J0cy5kb2MgJiZcbiAgICAgICAgaW1wb3J0cy5kb2MudGFncy5zb21lKHQgPT4gdC50aXRsZSA9PT0gJ2RlcHJlY2F0ZWQnICYmIChtb2R1bGVEZXByZWNhdGlvbiA9IHQpKSkge1xuICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBtZXNzYWdlKG1vZHVsZURlcHJlY2F0aW9uKSB9KVxuICAgIH1cblxuICAgIGlmIChpbXBvcnRzLmVycm9ycy5sZW5ndGgpIHtcbiAgICAgIGltcG9ydHMucmVwb3J0RXJyb3JzKGNvbnRleHQsIG5vZGUpXG4gICAgICByZXR1cm5cbiAgICB9XG5cbiAgICBub2RlLnNwZWNpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAoaW0pIHtcbiAgICAgIGxldCBpbXBvcnRlZCwgbG9jYWxcbiAgICAgIHN3aXRjaCAoaW0udHlwZSkge1xuXG5cbiAgICAgICAgY2FzZSAnSW1wb3J0TmFtZXNwYWNlU3BlY2lmaWVyJzp7XG4gICAgICAgICAgaWYgKCFpbXBvcnRzLnNpemUpIHJldHVyblxuICAgICAgICAgIG5hbWVzcGFjZXMuc2V0KGltLmxvY2FsLm5hbWUsIGltcG9ydHMpXG4gICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cblxuICAgICAgICBjYXNlICdJbXBvcnREZWZhdWx0U3BlY2lmaWVyJzpcbiAgICAgICAgICBpbXBvcnRlZCA9ICdkZWZhdWx0J1xuICAgICAgICAgIGxvY2FsID0gaW0ubG9jYWwubmFtZVxuICAgICAgICAgIGJyZWFrXG5cbiAgICAgICAgY2FzZSAnSW1wb3J0U3BlY2lmaWVyJzpcbiAgICAgICAgICBpbXBvcnRlZCA9IGltLmltcG9ydGVkLm5hbWVcbiAgICAgICAgICBsb2NhbCA9IGltLmxvY2FsLm5hbWVcbiAgICAgICAgICBicmVha1xuXG4gICAgICAgIGRlZmF1bHQ6IHJldHVybiAvLyBjYW4ndCBoYW5kbGUgdGhpcyBvbmVcbiAgICAgIH1cblxuICAgICAgLy8gdW5rbm93biB0aGluZyBjYW4ndCBiZSBkZXByZWNhdGVkXG4gICAgICBjb25zdCBleHBvcnRlZCA9IGltcG9ydHMuZ2V0KGltcG9ydGVkKVxuICAgICAgaWYgKGV4cG9ydGVkID09IG51bGwpIHJldHVyblxuXG4gICAgICAvLyBjYXB0dXJlIGltcG9ydCBvZiBkZWVwIG5hbWVzcGFjZVxuICAgICAgaWYgKGV4cG9ydGVkLm5hbWVzcGFjZSkgbmFtZXNwYWNlcy5zZXQobG9jYWwsIGV4cG9ydGVkLm5hbWVzcGFjZSlcblxuICAgICAgY29uc3QgZGVwcmVjYXRpb24gPSBnZXREZXByZWNhdGlvbihpbXBvcnRzLmdldChpbXBvcnRlZCkpXG4gICAgICBpZiAoIWRlcHJlY2F0aW9uKSByZXR1cm5cblxuICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlOiBpbSwgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGlvbikgfSlcblxuICAgICAgZGVwcmVjYXRlZC5zZXQobG9jYWwsIGRlcHJlY2F0aW9uKVxuXG4gICAgfSlcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJ1Byb2dyYW0nOiAoeyBib2R5IH0pID0+IGJvZHkuZm9yRWFjaChjaGVja1NwZWNpZmllcnMpLFxuXG4gICAgJ0lkZW50aWZpZXInOiBmdW5jdGlvbiAobm9kZSkge1xuICAgICAgaWYgKG5vZGUucGFyZW50LnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJyAmJiBub2RlLnBhcmVudC5wcm9wZXJ0eSA9PT0gbm9kZSkge1xuICAgICAgICByZXR1cm4gLy8gaGFuZGxlZCBieSBNZW1iZXJFeHByZXNzaW9uXG4gICAgICB9XG5cbiAgICAgIC8vIGlnbm9yZSBzcGVjaWZpZXIgaWRlbnRpZmllcnNcbiAgICAgIGlmIChub2RlLnBhcmVudC50eXBlLnNsaWNlKDAsIDYpID09PSAnSW1wb3J0JykgcmV0dXJuXG5cbiAgICAgIGlmICghZGVwcmVjYXRlZC5oYXMobm9kZS5uYW1lKSkgcmV0dXJuXG5cbiAgICAgIGlmIChkZWNsYXJlZFNjb3BlKGNvbnRleHQsIG5vZGUubmFtZSkgIT09ICdtb2R1bGUnKSByZXR1cm5cbiAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgbm9kZSxcbiAgICAgICAgbWVzc2FnZTogbWVzc2FnZShkZXByZWNhdGVkLmdldChub2RlLm5hbWUpKSxcbiAgICAgIH0pXG4gICAgfSxcblxuICAgICdNZW1iZXJFeHByZXNzaW9uJzogZnVuY3Rpb24gKGRlcmVmZXJlbmNlKSB7XG4gICAgICBpZiAoZGVyZWZlcmVuY2Uub2JqZWN0LnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuXG4gICAgICBpZiAoIW5hbWVzcGFjZXMuaGFzKGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKSkgcmV0dXJuXG5cbiAgICAgIGlmIChkZWNsYXJlZFNjb3BlKGNvbnRleHQsIGRlcmVmZXJlbmNlLm9iamVjdC5uYW1lKSAhPT0gJ21vZHVsZScpIHJldHVyblxuXG4gICAgICAvLyBnbyBkZWVwXG4gICAgICB2YXIgbmFtZXNwYWNlID0gbmFtZXNwYWNlcy5nZXQoZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWUpXG4gICAgICB2YXIgbmFtZXBhdGggPSBbZGVyZWZlcmVuY2Uub2JqZWN0Lm5hbWVdXG4gICAgICAvLyB3aGlsZSBwcm9wZXJ0eSBpcyBuYW1lc3BhY2UgYW5kIHBhcmVudCBpcyBtZW1iZXIgZXhwcmVzc2lvbiwga2VlcCB2YWxpZGF0aW5nXG4gICAgICB3aGlsZSAobmFtZXNwYWNlIGluc3RhbmNlb2YgRXhwb3J0cyAmJlxuICAgICAgICAgICAgIGRlcmVmZXJlbmNlLnR5cGUgPT09ICdNZW1iZXJFeHByZXNzaW9uJykge1xuXG4gICAgICAgIC8vIGlnbm9yZSBjb21wdXRlZCBwYXJ0cyBmb3Igbm93XG4gICAgICAgIGlmIChkZXJlZmVyZW5jZS5jb21wdXRlZCkgcmV0dXJuXG5cbiAgICAgICAgY29uc3QgbWV0YWRhdGEgPSBuYW1lc3BhY2UuZ2V0KGRlcmVmZXJlbmNlLnByb3BlcnR5Lm5hbWUpXG5cbiAgICAgICAgaWYgKCFtZXRhZGF0YSkgYnJlYWtcbiAgICAgICAgY29uc3QgZGVwcmVjYXRpb24gPSBnZXREZXByZWNhdGlvbihtZXRhZGF0YSlcblxuICAgICAgICBpZiAoZGVwcmVjYXRpb24pIHtcbiAgICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGU6IGRlcmVmZXJlbmNlLnByb3BlcnR5LCBtZXNzYWdlOiBtZXNzYWdlKGRlcHJlY2F0aW9uKSB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gc3Rhc2ggYW5kIHBvcFxuICAgICAgICBuYW1lcGF0aC5wdXNoKGRlcmVmZXJlbmNlLnByb3BlcnR5Lm5hbWUpXG4gICAgICAgIG5hbWVzcGFjZSA9IG1ldGFkYXRhLm5hbWVzcGFjZVxuICAgICAgICBkZXJlZmVyZW5jZSA9IGRlcmVmZXJlbmNlLnBhcmVudFxuICAgICAgfVxuICAgIH0sXG4gIH1cbn1cblxuZnVuY3Rpb24gbWVzc2FnZShkZXByZWNhdGlvbikge1xuICByZXR1cm4gJ0RlcHJlY2F0ZWQnICsgKGRlcHJlY2F0aW9uLmRlc2NyaXB0aW9uID8gJzogJyArIGRlcHJlY2F0aW9uLmRlc2NyaXB0aW9uIDogJy4nKVxufVxuXG5mdW5jdGlvbiBnZXREZXByZWNhdGlvbihtZXRhZGF0YSkge1xuICBpZiAoIW1ldGFkYXRhIHx8ICFtZXRhZGF0YS5kb2MpIHJldHVyblxuXG4gIGxldCBkZXByZWNhdGlvblxuICBpZiAobWV0YWRhdGEuZG9jLnRhZ3Muc29tZSh0ID0+IHQudGl0bGUgPT09ICdkZXByZWNhdGVkJyAmJiAoZGVwcmVjYXRpb24gPSB0KSkpIHtcbiAgICByZXR1cm4gZGVwcmVjYXRpb25cbiAgfVxufVxuIl19