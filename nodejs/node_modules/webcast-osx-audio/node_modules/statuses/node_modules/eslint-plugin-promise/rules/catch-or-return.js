module.exports = function (context) {
  var options = context.options[0] || {}
  var allowThen = options.allowThen

  return {
    ExpressionStatement: function (node) {
      // hello.then()
      if (node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.property.name === 'then'
      ) {
        // hello.then().then(a, b)
        if (allowThen && node.expression.arguments.length === 2) {
          return
        }
        context.report(node, 'Expected catch() or return')
        return
      }

      // hello.then().then().catch()
      if (node.expression.type === 'CallExpression' &&
        node.expression.callee.type === 'MemberExpression' &&
        node.expression.callee.object.type === 'CallExpression' &&
        node.expression.callee.object.callee.type === 'MemberExpression' &&
        node.expression.callee.object.callee.property.name === 'then'
      ) {
        var propName = node.expression.callee.property.name
        if (propName !== 'catch') {
          context.report(node, 'Expected catch() or return')
        }
      }
    }
  }
}
