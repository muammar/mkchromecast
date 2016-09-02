module.exports = function (context) {
  return {
    MemberExpression: function (node) {
      var body, lastItem

      // hello.then(function() { })
      if (node.property.name === 'then' &&
        node.parent.type === 'CallExpression' &&
        node.parent.arguments[0] &&
        node.parent.arguments[0].type === 'FunctionExpression'
      ) {
        body = node.parent.arguments[0].body.body
        lastItem = body[body.length - 1]
        if (!lastItem || lastItem.type !== 'ReturnStatement') {
          context.report(node, 'Each then() should return a value')
        }
        return
      }

      // hello.then(() => {})
      if (node.property.name === 'then' &&
        node.parent.type === 'CallExpression' &&
        node.parent.arguments[0] &&
        node.parent.arguments[0].type === 'ArrowFunctionExpression' &&
        node.parent.arguments[0].body.type === 'BlockStatement'
      ) {
        body = node.parent.arguments[0].body.body
        lastItem = body[body.length - 1]
        if (!lastItem || lastItem.type !== 'ReturnStatement') {
          context.report(node, 'Each then() should return a value')
        }
        return
      }
    }
  }
}
