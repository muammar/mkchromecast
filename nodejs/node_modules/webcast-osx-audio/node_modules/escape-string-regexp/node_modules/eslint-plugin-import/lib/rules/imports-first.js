'use strict';

module.exports = function (context) {
  function isPossibleDirective(node) {
    return node.type === 'ExpressionStatement' && node.expression.type === 'Literal' && typeof node.expression.value === 'string';
  }

  return {
    'Program': function Program(n) {
      var body = n.body,
          absoluteFirst = context.options[0] === 'absolute-first';
      var nonImportCount = 0,
          anyExpressions = false,
          anyRelative = false;
      body.forEach(function (node) {
        if (!anyExpressions && isPossibleDirective(node)) {
          return;
        }

        anyExpressions = true;

        if (node.type === 'ImportDeclaration') {
          if (absoluteFirst) {
            if (/^\./.test(node.source.value)) {
              anyRelative = true;
            } else if (anyRelative) {
              context.report({
                node: node.source,
                message: 'Absolute imports should come before relative imports.'
              });
            }
          }
          if (nonImportCount > 0) {
            context.report({
              node: node,
              message: 'Import in body of module; reorder to top.'
            });
          }
        } else {
          nonImportCount++;
        }
      });
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL2ltcG9ydHMtZmlyc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxPQUFWLEVBQW1CO0FBQ2xDLFdBQVMsbUJBQVQsQ0FBOEIsSUFBOUIsRUFBb0M7QUFDbEMsV0FBTyxLQUFLLElBQUwsS0FBYyxxQkFBZCxJQUNMLEtBQUssVUFBTCxDQUFnQixJQUFoQixLQUF5QixTQURwQixJQUVMLE9BQU8sS0FBSyxVQUFMLENBQWdCLEtBQXZCLEtBQWlDLFFBRm5DO0FBR0Q7O0FBRUQsU0FBTztBQUNMLGVBQVcsaUJBQVUsQ0FBVixFQUFhO0FBQ3RCLFVBQU0sT0FBTyxFQUFFLElBQWY7QUFBQSxVQUNNLGdCQUFnQixRQUFRLE9BQVIsQ0FBZ0IsQ0FBaEIsTUFBdUIsZ0JBRDdDO0FBRUEsVUFBSSxpQkFBaUIsQ0FBckI7QUFBQSxVQUNJLGlCQUFpQixLQURyQjtBQUFBLFVBRUksY0FBYyxLQUZsQjtBQUdBLFdBQUssT0FBTCxDQUFhLFVBQVUsSUFBVixFQUFlO0FBQzFCLFlBQUksQ0FBQyxjQUFELElBQW1CLG9CQUFvQixJQUFwQixDQUF2QixFQUFrRDtBQUNoRDtBQUNEOztBQUVELHlCQUFpQixJQUFqQjs7QUFFQSxZQUFJLEtBQUssSUFBTCxLQUFjLG1CQUFsQixFQUF1QztBQUNyQyxjQUFJLGFBQUosRUFBbUI7QUFDakIsZ0JBQUksTUFBTSxJQUFOLENBQVcsS0FBSyxNQUFMLENBQVksS0FBdkIsQ0FBSixFQUFtQztBQUNqQyw0QkFBYyxJQUFkO0FBQ0QsYUFGRCxNQUVPLElBQUksV0FBSixFQUFpQjtBQUN0QixzQkFBUSxNQUFSLENBQWU7QUFDYixzQkFBTSxLQUFLLE1BREU7QUFFYix5QkFBUztBQUZJLGVBQWY7QUFJRDtBQUNGO0FBQ0QsY0FBSSxpQkFBaUIsQ0FBckIsRUFBd0I7QUFDdEIsb0JBQVEsTUFBUixDQUFlO0FBQ2Isd0JBRGE7QUFFYix1QkFBUztBQUZJLGFBQWY7QUFJRDtBQUNGLFNBakJELE1BaUJPO0FBQ0w7QUFDRDtBQUNGLE9BM0JEO0FBNEJEO0FBbkNJLEdBQVA7QUFxQ0QsQ0E1Q0QiLCJmaWxlIjoicnVsZXMvaW1wb3J0cy1maXJzdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcbiAgZnVuY3Rpb24gaXNQb3NzaWJsZURpcmVjdGl2ZSAobm9kZSkge1xuICAgIHJldHVybiBub2RlLnR5cGUgPT09ICdFeHByZXNzaW9uU3RhdGVtZW50JyAmJlxuICAgICAgbm9kZS5leHByZXNzaW9uLnR5cGUgPT09ICdMaXRlcmFsJyAmJlxuICAgICAgdHlwZW9mIG5vZGUuZXhwcmVzc2lvbi52YWx1ZSA9PT0gJ3N0cmluZydcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgJ1Byb2dyYW0nOiBmdW5jdGlvbiAobikge1xuICAgICAgY29uc3QgYm9keSA9IG4uYm9keVxuICAgICAgICAgICwgYWJzb2x1dGVGaXJzdCA9IGNvbnRleHQub3B0aW9uc1swXSA9PT0gJ2Fic29sdXRlLWZpcnN0J1xuICAgICAgbGV0IG5vbkltcG9ydENvdW50ID0gMFxuICAgICAgICAsIGFueUV4cHJlc3Npb25zID0gZmFsc2VcbiAgICAgICAgLCBhbnlSZWxhdGl2ZSA9IGZhbHNlXG4gICAgICBib2R5LmZvckVhY2goZnVuY3Rpb24gKG5vZGUpe1xuICAgICAgICBpZiAoIWFueUV4cHJlc3Npb25zICYmIGlzUG9zc2libGVEaXJlY3RpdmUobm9kZSkpIHtcbiAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGFueUV4cHJlc3Npb25zID0gdHJ1ZVxuICAgICAgICAgXG4gICAgICAgIGlmIChub2RlLnR5cGUgPT09ICdJbXBvcnREZWNsYXJhdGlvbicpIHtcbiAgICAgICAgICBpZiAoYWJzb2x1dGVGaXJzdCkge1xuICAgICAgICAgICAgaWYgKC9eXFwuLy50ZXN0KG5vZGUuc291cmNlLnZhbHVlKSkge1xuICAgICAgICAgICAgICBhbnlSZWxhdGl2ZSA9IHRydWVcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYW55UmVsYXRpdmUpIHtcbiAgICAgICAgICAgICAgY29udGV4dC5yZXBvcnQoe1xuICAgICAgICAgICAgICAgIG5vZGU6IG5vZGUuc291cmNlLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdBYnNvbHV0ZSBpbXBvcnRzIHNob3VsZCBjb21lIGJlZm9yZSByZWxhdGl2ZSBpbXBvcnRzLicsXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChub25JbXBvcnRDb3VudCA+IDApIHtcbiAgICAgICAgICAgIGNvbnRleHQucmVwb3J0KHtcbiAgICAgICAgICAgICAgbm9kZSxcbiAgICAgICAgICAgICAgbWVzc2FnZTogJ0ltcG9ydCBpbiBib2R5IG9mIG1vZHVsZTsgcmVvcmRlciB0byB0b3AuJyxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG5vbkltcG9ydENvdW50KytcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICB9LFxuICB9XG59XG4iXX0=