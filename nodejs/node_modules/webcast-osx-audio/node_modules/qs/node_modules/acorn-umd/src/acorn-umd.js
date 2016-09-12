import {assign, clone, find, filter, matches, pluck, reject, result, sortBy, take, zip} from 'lodash';
import estraverse from 'estraverse';
import Node from './Node';
import ImportNode from './ImportNode';

const isRequireCallee = matches({
  type: 'CallExpression',
  callee: {
    name: 'require',
    type: 'Identifier'
  }
});

const isDefineCallee = matches({
  type: 'CallExpression',
  callee: {
    name: 'define',
    type: 'Identifier'
  }
});

const isArrayExpr = matches({
  type: 'ArrayExpression'
});

function isFuncExpr(node) {
  return /FunctionExpression$/.test(node.type);
}

// Set up an AST Node similar to an ES6 import node
function constructImportNode(ast, node, type) {
  let {start, end} = node;
  return new ImportNode(ast, node, {
    type,
    specifiers: [],
    start, end
  });
}

function createImportSpecifier(source, definition, isDef) {
  let imported;
  if (definition.type === 'MemberExpression') {
    imported = clone(definition.property);
    isDef = false;
  }

  // Add the specifier
  let {name, type, start, end} = source;

  return new Node({
    start, end,
    type: 'ImportSpecifier',
    local: {
      type, start, end, name
    },
    imported,
    default: isDef
  });
}

function createSourceNode(node, source) {
  let {value, raw, start, end} = source;
  return new Node({
    type: 'Literal',
    reference: node,
    value, raw, start, end
  });
}

function setImportSource(result, node, importExpr) {
  if (importExpr.type === 'MemberExpression') {
    importExpr = importExpr.object;
  }

  result.source = createSourceNode(node, importExpr.arguments[0]);
  return result;
}

function constructCJSImportNode(ast, node) {
  let result = constructImportNode(ast, node, 'CJSImport');
  let importExpr;

  switch (node.type) {
    case 'MemberExpression':
    case 'CallExpression':
      importExpr = node;
      break;
    case 'AssignmentExpression':
      let specifier = createImportSpecifier(node.left, node.right, false);
      let {name} = node.left.property || node.left;
      specifier.local.name = name;
      result.specifiers.push(specifier);
      importExpr = node.right;
      break;
    case 'VariableDeclarator':
      // init for var, value for property
      importExpr = node.init;
      result.specifiers.push(createImportSpecifier(node.id, importExpr, true));
      break;
    case 'Property': {
      // init for var, value for property
      importExpr = node.value;
      result.specifiers.push(createImportSpecifier(node.key, importExpr, false));
    }
  }

  return setImportSource(result, node, importExpr);
}

function findCJS(ast) {
  // Recursively walk ast searching for requires
  let requires = [];

  estraverse.traverse(ast, {
    enter(node) {
      function checkRequire(expr) {
        if (result(expr, 'type') === 'MemberExpression') {
          expr = expr.object;
        }
        if (expr && isRequireCallee(expr)) {
          requires.push(node);
          return true;
        }
      }

      switch (node.type) {
        case 'MemberExpression':
        case 'CallExpression':
          checkRequire(node);
          break;
        case 'AssignmentExpression':
          checkRequire(node.right);
          break;
        case 'Property':
          checkRequire(node.value);
          break;
        case 'VariableDeclarator':
          checkRequire(node.init);
      }
    }
  });

  // Filter the overlapping requires (e.g. if var x = require('./x') it'll show up twice).
  // Do this by just checking line #'s
  return reject(requires, node => {
      return requires.some(parent =>
        [node.start, node.stop].some(pos => pos > parent.start && pos < parent.end));
    })
    .map(node => constructCJSImportNode(ast, node));
}

// Note there can be more than one define per file with global registeration.
function findAMD(ast) {
  return pluck(filter(ast.body, {
    type: 'ExpressionStatement'
  }), 'expression')
  .filter(isDefineCallee)
  // Ensure the define takes params and has a function
  .filter(node => node.arguments.length <= 3)
  .filter(node => filter(node.arguments, isFuncExpr).length === 1)
  .filter(node => filter(node.arguments, isArrayExpr).length <= 1)
  // Now just zip the array arguments and the provided function params
  .map(node => {
    let outnode = constructImportNode(ast, node, 'AMDImport');

    let func = find(node.arguments, isFuncExpr);
    let imports = find(node.arguments, isArrayExpr) || {elements: []};

    let params = take(func.params, imports.elements.length);
    outnode.specifiers = params;

    if (imports) {
      // Use an array even though its not spec as there isn't a better way to
      // represent this structure
      outnode.sources = imports.elements.map(imp => createSourceNode(node, imp));
      // Make nicer repr: [[importSrc, paramName]]
      outnode.imports = zip(imports.elements, params);
    }
    return outnode;
  });
}

export default function(ast, options) {
  options = assign({
    cjs: true,
    // TODO
    amd: false,
    es6: true
  }, options);

  let result = [];

  if (options.cjs) {
    result.push(...findCJS(ast));
  }

  if (options.es6) {
    result.push(...filter(ast.body, {
      type: 'ImportDeclaration'
    })
    .map(node => new ImportNode(ast, node, node)));
  }

  if (options.amd) {
    result.push(...findAMD(ast));
  }

  return sortBy(result, 'start');
}