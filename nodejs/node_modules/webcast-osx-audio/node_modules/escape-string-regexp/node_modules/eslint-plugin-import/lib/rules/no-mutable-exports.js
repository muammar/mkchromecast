'use strict';

module.exports = function (context) {
  function checkDeclaration(node) {
    var kind = node.kind;

    if (kind === 'var' || kind === 'let') {
      context.report(node, 'Exporting mutable \'' + kind + '\' binding, use \'const\' instead.');
    }
  }

  function checkDeclarationsInScope(_ref, name) {
    var variables = _ref.variables;

    variables.forEach(function (variable) {
      if (variable.name === name) {
        variable.defs.forEach(function (def) {
          if (def.type === 'Variable') {
            checkDeclaration(def.parent);
          }
        });
      }
    });
  }

  function handleExportDefault(node) {
    var scope = context.getScope();

    if (node.declaration.name) {
      checkDeclarationsInScope(scope, node.declaration.name);
    }
  }

  function handleExportNamed(node) {
    var scope = context.getScope();

    if (node.declaration) {
      checkDeclaration(node.declaration);
    } else if (!node.source) {
      node.specifiers.forEach(function (specifier) {
        checkDeclarationsInScope(scope, specifier.local.name);
      });
    }
  }

  return {
    'ExportDefaultDeclaration': handleExportDefault,
    'ExportNamedDeclaration': handleExportNamed
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLW11dGFibGUtZXhwb3J0cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLE9BQU8sT0FBUCxHQUFpQixVQUFVLE9BQVYsRUFBbUI7QUFDbEMsV0FBUyxnQkFBVCxDQUEwQixJQUExQixFQUFnQztBQUFBLFFBQ3ZCLElBRHVCLEdBQ2YsSUFEZSxDQUN2QixJQUR1Qjs7QUFFOUIsUUFBSSxTQUFTLEtBQVQsSUFBa0IsU0FBUyxLQUEvQixFQUFzQztBQUNwQyxjQUFRLE1BQVIsQ0FBZSxJQUFmLDJCQUEyQyxJQUEzQztBQUNEO0FBQ0Y7O0FBRUQsV0FBUyx3QkFBVCxPQUErQyxJQUEvQyxFQUFxRDtBQUFBLFFBQWxCLFNBQWtCLFFBQWxCLFNBQWtCOztBQUNuRCxjQUFVLE9BQVYsQ0FBa0IsVUFBQyxRQUFELEVBQWM7QUFDOUIsVUFBSSxTQUFTLElBQVQsS0FBa0IsSUFBdEIsRUFBNEI7QUFDMUIsaUJBQVMsSUFBVCxDQUFjLE9BQWQsQ0FBc0IsVUFBQyxHQUFELEVBQVM7QUFDN0IsY0FBSSxJQUFJLElBQUosS0FBYSxVQUFqQixFQUE2QjtBQUMzQiw2QkFBaUIsSUFBSSxNQUFyQjtBQUNEO0FBQ0YsU0FKRDtBQUtEO0FBQ0YsS0FSRDtBQVNEOztBQUVELFdBQVMsbUJBQVQsQ0FBNkIsSUFBN0IsRUFBbUM7QUFDakMsUUFBTSxRQUFRLFFBQVEsUUFBUixFQUFkOztBQUVBLFFBQUksS0FBSyxXQUFMLENBQWlCLElBQXJCLEVBQTJCO0FBQ3pCLCtCQUF5QixLQUF6QixFQUFnQyxLQUFLLFdBQUwsQ0FBaUIsSUFBakQ7QUFDRDtBQUNGOztBQUVELFdBQVMsaUJBQVQsQ0FBMkIsSUFBM0IsRUFBaUM7QUFDL0IsUUFBTSxRQUFRLFFBQVEsUUFBUixFQUFkOztBQUVBLFFBQUksS0FBSyxXQUFULEVBQXVCO0FBQ3JCLHVCQUFpQixLQUFLLFdBQXRCO0FBQ0QsS0FGRCxNQUVPLElBQUksQ0FBQyxLQUFLLE1BQVYsRUFBa0I7QUFDdkIsV0FBSyxVQUFMLENBQWdCLE9BQWhCLENBQXdCLFVBQUMsU0FBRCxFQUFlO0FBQ3JDLGlDQUF5QixLQUF6QixFQUFnQyxVQUFVLEtBQVYsQ0FBZ0IsSUFBaEQ7QUFDRCxPQUZEO0FBR0Q7QUFDRjs7QUFFRCxTQUFPO0FBQ0wsZ0NBQTRCLG1CQUR2QjtBQUVMLDhCQUEwQjtBQUZyQixHQUFQO0FBSUQsQ0E1Q0QiLCJmaWxlIjoicnVsZXMvbm8tbXV0YWJsZS1leHBvcnRzLmpzIiwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCkge1xuICBmdW5jdGlvbiBjaGVja0RlY2xhcmF0aW9uKG5vZGUpIHtcbiAgICBjb25zdCB7a2luZH0gPSBub2RlXG4gICAgaWYgKGtpbmQgPT09ICd2YXInIHx8IGtpbmQgPT09ICdsZXQnKSB7XG4gICAgICBjb250ZXh0LnJlcG9ydChub2RlLCBgRXhwb3J0aW5nIG11dGFibGUgJyR7a2luZH0nIGJpbmRpbmcsIHVzZSAnY29uc3QnIGluc3RlYWQuYClcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoe3ZhcmlhYmxlc30sIG5hbWUpIHtcbiAgICB2YXJpYWJsZXMuZm9yRWFjaCgodmFyaWFibGUpID0+IHtcbiAgICAgIGlmICh2YXJpYWJsZS5uYW1lID09PSBuYW1lKSB7XG4gICAgICAgIHZhcmlhYmxlLmRlZnMuZm9yRWFjaCgoZGVmKSA9PiB7XG4gICAgICAgICAgaWYgKGRlZi50eXBlID09PSAnVmFyaWFibGUnKSB7XG4gICAgICAgICAgICBjaGVja0RlY2xhcmF0aW9uKGRlZi5wYXJlbnQpXG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGVFeHBvcnREZWZhdWx0KG5vZGUpIHtcbiAgICBjb25zdCBzY29wZSA9IGNvbnRleHQuZ2V0U2NvcGUoKVxuXG4gICAgaWYgKG5vZGUuZGVjbGFyYXRpb24ubmFtZSkge1xuICAgICAgY2hlY2tEZWNsYXJhdGlvbnNJblNjb3BlKHNjb3BlLCBub2RlLmRlY2xhcmF0aW9uLm5hbWUpXG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gaGFuZGxlRXhwb3J0TmFtZWQobm9kZSkge1xuICAgIGNvbnN0IHNjb3BlID0gY29udGV4dC5nZXRTY29wZSgpXG5cbiAgICBpZiAobm9kZS5kZWNsYXJhdGlvbikgIHtcbiAgICAgIGNoZWNrRGVjbGFyYXRpb24obm9kZS5kZWNsYXJhdGlvbilcbiAgICB9IGVsc2UgaWYgKCFub2RlLnNvdXJjZSkge1xuICAgICAgbm9kZS5zcGVjaWZpZXJzLmZvckVhY2goKHNwZWNpZmllcikgPT4ge1xuICAgICAgICBjaGVja0RlY2xhcmF0aW9uc0luU2NvcGUoc2NvcGUsIHNwZWNpZmllci5sb2NhbC5uYW1lKVxuICAgICAgfSlcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgICdFeHBvcnREZWZhdWx0RGVjbGFyYXRpb24nOiBoYW5kbGVFeHBvcnREZWZhdWx0LFxuICAgICdFeHBvcnROYW1lZERlY2xhcmF0aW9uJzogaGFuZGxlRXhwb3J0TmFtZWQsXG4gIH1cbn1cbiJdfQ==