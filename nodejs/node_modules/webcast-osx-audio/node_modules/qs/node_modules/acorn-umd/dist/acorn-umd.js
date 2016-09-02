var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

var _lodash = require("lodash");

var assign = _lodash.assign;
var clone = _lodash.clone;
var find = _lodash.find;
var filter = _lodash.filter;
var matches = _lodash.matches;
var pluck = _lodash.pluck;
var reject = _lodash.reject;
var result = _lodash.result;
var sortBy = _lodash.sortBy;
var take = _lodash.take;
var zip = _lodash.zip;

var estraverse = _interopRequire(require("estraverse"));

var Node = _interopRequire(require("./Node"));

var ImportNode = _interopRequire(require("./ImportNode"));

var isRequireCallee = matches({
  type: "CallExpression",
  callee: {
    name: "require",
    type: "Identifier"
  }
});

var isDefineCallee = matches({
  type: "CallExpression",
  callee: {
    name: "define",
    type: "Identifier"
  }
});

var isArrayExpr = matches({
  type: "ArrayExpression"
});

function isFuncExpr(node) {
  return /FunctionExpression$/.test(node.type);
}

// Set up an AST Node similar to an ES6 import node
function constructImportNode(ast, node, type) {
  var start = node.start;
  var end = node.end;

  return new ImportNode(ast, node, {
    type: type,
    specifiers: [],
    start: start, end: end
  });
}

function createImportSpecifier(source, definition, isDef) {
  var imported = undefined;
  if (definition.type === "MemberExpression") {
    imported = clone(definition.property);
    isDef = false;
  }

  // Add the specifier
  var name = source.name;
  var type = source.type;
  var start = source.start;
  var end = source.end;

  return new Node({
    start: start, end: end,
    type: "ImportSpecifier",
    local: {
      type: type, start: start, end: end, name: name
    },
    imported: imported,
    "default": isDef
  });
}

function createSourceNode(node, source) {
  var value = source.value;
  var raw = source.raw;
  var start = source.start;
  var end = source.end;

  return new Node({
    type: "Literal",
    reference: node,
    value: value, raw: raw, start: start, end: end
  });
}

function setImportSource(result, node, importExpr) {
  if (importExpr.type === "MemberExpression") {
    importExpr = importExpr.object;
  }

  result.source = createSourceNode(node, importExpr.arguments[0]);
  return result;
}

function constructCJSImportNode(ast, node) {
  var result = constructImportNode(ast, node, "CJSImport");
  var importExpr = undefined;

  switch (node.type) {
    case "MemberExpression":
    case "CallExpression":
      importExpr = node;
      break;
    case "AssignmentExpression":
      var specifier = createImportSpecifier(node.left, node.right, false);

      var _ref = node.left.property || node.left,
          name = _ref.name;

      specifier.local.name = name;
      result.specifiers.push(specifier);
      importExpr = node.right;
      break;
    case "VariableDeclarator":
      // init for var, value for property
      importExpr = node.init;
      result.specifiers.push(createImportSpecifier(node.id, importExpr, true));
      break;
    case "Property":
      {
        // init for var, value for property
        importExpr = node.value;
        result.specifiers.push(createImportSpecifier(node.key, importExpr, false));
      }
  }

  return setImportSource(result, node, importExpr);
}

function findCJS(ast) {
  // Recursively walk ast searching for requires
  var requires = [];

  estraverse.traverse(ast, {
    enter: function enter(node) {
      function checkRequire(expr) {
        if (result(expr, "type") === "MemberExpression") {
          expr = expr.object;
        }
        if (expr && isRequireCallee(expr)) {
          requires.push(node);
          return true;
        }
      }

      switch (node.type) {
        case "MemberExpression":
        case "CallExpression":
          checkRequire(node);
          break;
        case "AssignmentExpression":
          checkRequire(node.right);
          break;
        case "Property":
          checkRequire(node.value);
          break;
        case "VariableDeclarator":
          checkRequire(node.init);
      }
    }
  });

  // Filter the overlapping requires (e.g. if var x = require('./x') it'll show up twice).
  // Do this by just checking line #'s
  return reject(requires, function (node) {
    return requires.some(function (parent) {
      return [node.start, node.stop].some(function (pos) {
        return pos > parent.start && pos < parent.end;
      });
    });
  }).map(function (node) {
    return constructCJSImportNode(ast, node);
  });
}

// Note there can be more than one define per file with global registeration.
function findAMD(ast) {
  return pluck(filter(ast.body, {
    type: "ExpressionStatement"
  }), "expression").filter(isDefineCallee)
  // Ensure the define takes params and has a function
  .filter(function (node) {
    return node.arguments.length <= 3;
  }).filter(function (node) {
    return filter(node.arguments, isFuncExpr).length === 1;
  }).filter(function (node) {
    return filter(node.arguments, isArrayExpr).length <= 1;
  })
  // Now just zip the array arguments and the provided function params
  .map(function (node) {
    var outnode = constructImportNode(ast, node, "AMDImport");

    var func = find(node.arguments, isFuncExpr);
    var imports = find(node.arguments, isArrayExpr) || { elements: [] };

    var params = take(func.params, imports.elements.length);
    outnode.specifiers = params;

    if (imports) {
      // Use an array even though its not spec as there isn't a better way to
      // represent this structure
      outnode.sources = imports.elements.map(function (imp) {
        return createSourceNode(node, imp);
      });
      // Make nicer repr: [[importSrc, paramName]]
      outnode.imports = zip(imports.elements, params);
    }
    return outnode;
  });
}

module.exports = function (ast, options) {
  options = assign({
    cjs: true,
    // TODO
    amd: false,
    es6: true
  }, options);

  var result = [];

  if (options.cjs) {
    result.push.apply(result, _toConsumableArray(findCJS(ast)));
  }

  if (options.es6) {
    result.push.apply(result, _toConsumableArray(filter(ast.body, {
      type: "ImportDeclaration"
    }).map(function (node) {
      return new ImportNode(ast, node, node);
    })));
  }

  if (options.amd) {
    result.push.apply(result, _toConsumableArray(findAMD(ast)));
  }

  return sortBy(result, "start");
};