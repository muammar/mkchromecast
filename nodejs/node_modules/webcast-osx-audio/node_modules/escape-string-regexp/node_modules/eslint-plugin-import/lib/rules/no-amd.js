'use strict';

/**
 * @fileoverview Rule to prefer imports to AMD
 * @author Jamund Ferguson
 */

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function (context) {

  return {

    'CallExpression': function CallExpression(node) {
      if (context.getScope().type !== 'module') return;

      if (node.callee.type !== 'Identifier') return;
      if (node.callee.name !== 'require' && node.callee.name !== 'define') return;

      // todo: capture define((require, module, exports) => {}) form?
      if (node.arguments.length !== 2) return;

      var modules = node.arguments[0];
      if (modules.type !== 'ArrayExpression') return;

      // todo: check second arg type? (identifier or callback)

      context.report(node, 'Expected imports instead of AMD ' + node.callee.name + '().');
    }
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bGVzL25vLWFtZC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7OztBQUtBO0FBQ0E7QUFDQTs7QUFFQSxPQUFPLE9BQVAsR0FBaUIsVUFBVSxPQUFWLEVBQW1COztBQUVuQyxTQUFPOztBQUVOLHNCQUFrQix3QkFBVSxJQUFWLEVBQWdCO0FBQzlCLFVBQUksUUFBUSxRQUFSLEdBQW1CLElBQW5CLEtBQTRCLFFBQWhDLEVBQTBDOztBQUUxQyxVQUFJLEtBQUssTUFBTCxDQUFZLElBQVosS0FBcUIsWUFBekIsRUFBdUM7QUFDdkMsVUFBSSxLQUFLLE1BQUwsQ0FBWSxJQUFaLEtBQXFCLFNBQXJCLElBQ0EsS0FBSyxNQUFMLENBQVksSUFBWixLQUFxQixRQUR6QixFQUNtQzs7QUFFbkM7QUFDQSxVQUFJLEtBQUssU0FBTCxDQUFlLE1BQWYsS0FBMEIsQ0FBOUIsRUFBaUM7O0FBRWpDLFVBQU0sVUFBVSxLQUFLLFNBQUwsQ0FBZSxDQUFmLENBQWhCO0FBQ0EsVUFBSSxRQUFRLElBQVIsS0FBaUIsaUJBQXJCLEVBQXdDOztBQUV4Qzs7QUFFSCxjQUFRLE1BQVIsQ0FBZSxJQUFmLHVDQUF3RCxLQUFLLE1BQUwsQ0FBWSxJQUFwRTtBQUNBO0FBbEJLLEdBQVA7QUFxQkEsQ0F2QkQiLCJmaWxlIjoicnVsZXMvbm8tYW1kLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IFJ1bGUgdG8gcHJlZmVyIGltcG9ydHMgdG8gQU1EXG4gKiBAYXV0aG9yIEphbXVuZCBGZXJndXNvblxuICovXG5cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLyBSdWxlIERlZmluaXRpb25cbi8vLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKGNvbnRleHQpIHtcblxuXHRyZXR1cm4ge1xuXG5cdFx0J0NhbGxFeHByZXNzaW9uJzogZnVuY3Rpb24gKG5vZGUpIHtcbiAgICAgIGlmIChjb250ZXh0LmdldFNjb3BlKCkudHlwZSAhPT0gJ21vZHVsZScpIHJldHVyblxuXG4gICAgICBpZiAobm9kZS5jYWxsZWUudHlwZSAhPT0gJ0lkZW50aWZpZXInKSByZXR1cm5cbiAgICAgIGlmIChub2RlLmNhbGxlZS5uYW1lICE9PSAncmVxdWlyZScgJiZcbiAgICAgICAgICBub2RlLmNhbGxlZS5uYW1lICE9PSAnZGVmaW5lJykgcmV0dXJuXG5cbiAgICAgIC8vIHRvZG86IGNhcHR1cmUgZGVmaW5lKChyZXF1aXJlLCBtb2R1bGUsIGV4cG9ydHMpID0+IHt9KSBmb3JtP1xuICAgICAgaWYgKG5vZGUuYXJndW1lbnRzLmxlbmd0aCAhPT0gMikgcmV0dXJuXG5cbiAgICAgIGNvbnN0IG1vZHVsZXMgPSBub2RlLmFyZ3VtZW50c1swXVxuICAgICAgaWYgKG1vZHVsZXMudHlwZSAhPT0gJ0FycmF5RXhwcmVzc2lvbicpIHJldHVyblxuXG4gICAgICAvLyB0b2RvOiBjaGVjayBzZWNvbmQgYXJnIHR5cGU/IChpZGVudGlmaWVyIG9yIGNhbGxiYWNrKVxuXG5cdFx0XHRjb250ZXh0LnJlcG9ydChub2RlLCBgRXhwZWN0ZWQgaW1wb3J0cyBpbnN0ZWFkIG9mIEFNRCAke25vZGUuY2FsbGVlLm5hbWV9KCkuYClcblx0XHR9LFxuXHR9XG5cbn1cbiJdfQ==