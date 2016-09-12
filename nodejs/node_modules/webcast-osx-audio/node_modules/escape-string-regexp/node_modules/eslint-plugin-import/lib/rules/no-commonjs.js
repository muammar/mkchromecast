'use strict';

/**
 * @fileoverview Rule to prefer ES6 to CJS
 * @author Jamund Ferguson
 */

var EXPORT_MESSAGE = 'Expected "export" or "export default"',
    IMPORT_MESSAGE = 'Expected "import" instead of "require()"';

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------


module.exports = function (context) {

  return {

    'MemberExpression': function MemberExpression(node) {

      // module.exports
      if (node.object.name === 'module' && node.property.name === 'exports') {
        if (allowPrimitive(node, context)) return;
        context.report({ node: node, message: EXPORT_MESSAGE });
      }

      // exports.
      if (node.object.name === 'exports') {
        context.report({ node: node, message: EXPORT_MESSAGE });
      }
    },
    'CallExpression': function CallExpression(call) {
      if (context.getScope().type !== 'module') return;

      if (call.callee.type !== 'Identifier') return;
      if (call.callee.name !== 'require') return;

      if (call.arguments.length !== 1) return;
      var module = call.arguments[0];

      if (module.type !== 'Literal') return;
      if (typeof module.value !== 'string') return;

      // keeping it simple: all 1-string-arg `require` calls are reported
      context.report({
        node: call.callee,
        message: IMPORT_MESSAGE
      });
    }
  };
};

// allow non-objects as module.exports
function allowPrimitive(node, context) {
  if (context.options.indexOf('allow-primitive-modules') < 0) return false;
  if (node.parent.type !== 'AssignmentExpression') return false;
  return node.parent.right.type !== 'ObjectExpression';
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWNvbW1vbmpzLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUE7Ozs7O0FBS0EsSUFBTSxpQkFBaUIsdUNBQXZCO0FBQUEsSUFDTSxpQkFBaUIsMENBRHZCOztBQUdBO0FBQ0E7QUFDQTs7O0FBR0EsT0FBTyxPQUFQLEdBQWlCLFVBQVUsT0FBVixFQUFtQjs7QUFFbEMsU0FBTzs7QUFFTCx3QkFBb0IsMEJBQVUsSUFBVixFQUFnQjs7QUFFbEM7QUFDQSxVQUFJLEtBQUssTUFBTCxDQUFZLElBQVosS0FBcUIsUUFBckIsSUFBaUMsS0FBSyxRQUFMLENBQWMsSUFBZCxLQUF1QixTQUE1RCxFQUF1RTtBQUNyRSxZQUFJLGVBQWUsSUFBZixFQUFxQixPQUFyQixDQUFKLEVBQW1DO0FBQ25DLGdCQUFRLE1BQVIsQ0FBZSxFQUFFLFVBQUYsRUFBUSxTQUFTLGNBQWpCLEVBQWY7QUFDRDs7QUFFRDtBQUNBLFVBQUksS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixTQUF6QixFQUFvQztBQUNsQyxnQkFBUSxNQUFSLENBQWUsRUFBRSxVQUFGLEVBQVEsU0FBUyxjQUFqQixFQUFmO0FBQ0Q7QUFFRixLQWZJO0FBZ0JMLHNCQUFrQix3QkFBVSxJQUFWLEVBQWdCO0FBQ2hDLFVBQUksUUFBUSxRQUFSLEdBQW1CLElBQW5CLEtBQTRCLFFBQWhDLEVBQTBDOztBQUUxQyxVQUFJLEtBQUssTUFBTCxDQUFZLElBQVosS0FBcUIsWUFBekIsRUFBdUM7QUFDdkMsVUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLEtBQXFCLFNBQXpCLEVBQW9DOztBQUVwQyxVQUFJLEtBQUssU0FBTCxDQUFlLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7QUFDakMsVUFBSSxTQUFTLEtBQUssU0FBTCxDQUFlLENBQWYsQ0FBYjs7QUFFQSxVQUFJLE9BQU8sSUFBUCxLQUFnQixTQUFwQixFQUErQjtBQUMvQixVQUFJLE9BQU8sT0FBTyxLQUFkLEtBQXdCLFFBQTVCLEVBQXNDOztBQUV0QztBQUNBLGNBQVEsTUFBUixDQUFlO0FBQ2IsY0FBTSxLQUFLLE1BREU7QUFFYixpQkFBUztBQUZJLE9BQWY7QUFJRDtBQWpDSSxHQUFQO0FBb0NELENBdENEOztBQXdDRTtBQUNGLFNBQVMsY0FBVCxDQUF3QixJQUF4QixFQUE4QixPQUE5QixFQUF1QztBQUNyQyxNQUFJLFFBQVEsT0FBUixDQUFnQixPQUFoQixDQUF3Qix5QkFBeEIsSUFBcUQsQ0FBekQsRUFBNEQsT0FBTyxLQUFQO0FBQzVELE1BQUksS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixzQkFBekIsRUFBaUQsT0FBTyxLQUFQO0FBQ2pELFNBQVEsS0FBSyxNQUFMLENBQVksS0FBWixDQUFrQixJQUFsQixLQUEyQixrQkFBbkM7QUFDRCIsImZpbGUiOiJydWxlcy9uby1jb21tb25qcy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGZpbGVvdmVydmlldyBSdWxlIHRvIHByZWZlciBFUzYgdG8gQ0pTXG4gKiBAYXV0aG9yIEphbXVuZCBGZXJndXNvblxuICovXG5cbmNvbnN0IEVYUE9SVF9NRVNTQUdFID0gJ0V4cGVjdGVkIFwiZXhwb3J0XCIgb3IgXCJleHBvcnQgZGVmYXVsdFwiJ1xuICAgICwgSU1QT1JUX01FU1NBR0UgPSAnRXhwZWN0ZWQgXCJpbXBvcnRcIiBpbnN0ZWFkIG9mIFwicmVxdWlyZSgpXCInXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuXG4gIHJldHVybiB7XG5cbiAgICAnTWVtYmVyRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChub2RlKSB7XG5cbiAgICAgIC8vIG1vZHVsZS5leHBvcnRzXG4gICAgICBpZiAobm9kZS5vYmplY3QubmFtZSA9PT0gJ21vZHVsZScgJiYgbm9kZS5wcm9wZXJ0eS5uYW1lID09PSAnZXhwb3J0cycpIHtcbiAgICAgICAgaWYgKGFsbG93UHJpbWl0aXZlKG5vZGUsIGNvbnRleHQpKSByZXR1cm5cbiAgICAgICAgY29udGV4dC5yZXBvcnQoeyBub2RlLCBtZXNzYWdlOiBFWFBPUlRfTUVTU0FHRSB9KVxuICAgICAgfVxuXG4gICAgICAvLyBleHBvcnRzLlxuICAgICAgaWYgKG5vZGUub2JqZWN0Lm5hbWUgPT09ICdleHBvcnRzJykge1xuICAgICAgICBjb250ZXh0LnJlcG9ydCh7IG5vZGUsIG1lc3NhZ2U6IEVYUE9SVF9NRVNTQUdFIH0pXG4gICAgICB9XG5cbiAgICB9LFxuICAgICdDYWxsRXhwcmVzc2lvbic6IGZ1bmN0aW9uIChjYWxsKSB7XG4gICAgICBpZiAoY29udGV4dC5nZXRTY29wZSgpLnR5cGUgIT09ICdtb2R1bGUnKSByZXR1cm5cblxuICAgICAgaWYgKGNhbGwuY2FsbGVlLnR5cGUgIT09ICdJZGVudGlmaWVyJykgcmV0dXJuXG4gICAgICBpZiAoY2FsbC5jYWxsZWUubmFtZSAhPT0gJ3JlcXVpcmUnKSByZXR1cm5cblxuICAgICAgaWYgKGNhbGwuYXJndW1lbnRzLmxlbmd0aCAhPT0gMSkgcmV0dXJuXG4gICAgICB2YXIgbW9kdWxlID0gY2FsbC5hcmd1bWVudHNbMF1cblxuICAgICAgaWYgKG1vZHVsZS50eXBlICE9PSAnTGl0ZXJhbCcpIHJldHVyblxuICAgICAgaWYgKHR5cGVvZiBtb2R1bGUudmFsdWUgIT09ICdzdHJpbmcnKSByZXR1cm5cblxuICAgICAgLy8ga2VlcGluZyBpdCBzaW1wbGU6IGFsbCAxLXN0cmluZy1hcmcgYHJlcXVpcmVgIGNhbGxzIGFyZSByZXBvcnRlZFxuICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICBub2RlOiBjYWxsLmNhbGxlZSxcbiAgICAgICAgbWVzc2FnZTogSU1QT1JUX01FU1NBR0UsXG4gICAgICB9KVxuICAgIH0sXG4gIH1cblxufVxuXG4gIC8vIGFsbG93IG5vbi1vYmplY3RzIGFzIG1vZHVsZS5leHBvcnRzXG5mdW5jdGlvbiBhbGxvd1ByaW1pdGl2ZShub2RlLCBjb250ZXh0KSB7XG4gIGlmIChjb250ZXh0Lm9wdGlvbnMuaW5kZXhPZignYWxsb3ctcHJpbWl0aXZlLW1vZHVsZXMnKSA8IDApIHJldHVybiBmYWxzZVxuICBpZiAobm9kZS5wYXJlbnQudHlwZSAhPT0gJ0Fzc2lnbm1lbnRFeHByZXNzaW9uJykgcmV0dXJuIGZhbHNlXG4gIHJldHVybiAobm9kZS5wYXJlbnQucmlnaHQudHlwZSAhPT0gJ09iamVjdEV4cHJlc3Npb24nKVxufVxuIl19