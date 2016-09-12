'use strict';

var EspowerLocationDetector = require('espower-location-detector');
var estraverse = require('estraverse');
var cloneWithWhitelist = require('espurify').cloneWithWhitelist;
var babelgen = require('babel-generator');
var define = require('./define-properties');
var toBeCaptured = require('./to-be-captured');
var toBeSkipped = require('./to-be-skipped');
var fs = require('fs');
var helperCode = '(' +
  fs.readFileSync(require.resolve('./power-assert-recorder.js'), 'utf8')
    .split('\n')
    .slice(2)
    .join('\n')
  + ')()';

function BabelAssertionVisitor (babel, matcher, options) {
    this.babel = babel;
    this.matcher = matcher;
    this.options = options;
    this.currentArgumentNodePath = null;
    this.argumentModified = false;
    this.valueRecorder = null;
    this.locationDetector = new EspowerLocationDetector(this.options);
    var babelTemplate = babel.template;
    this.helperTemplate = babelTemplate(helperCode);
    var whiteListWithRange = Object.keys(options.astWhiteList).reduce(function (acc, key) {
        acc[key] = options.astWhiteList[key].concat(['range']);
        return acc;
    }, {});
    this.purifyAst = cloneWithWhitelist(whiteListWithRange);
}

BabelAssertionVisitor.prototype.enter = function (nodePath) {
    this.assertionNodePath = nodePath;
    var currentNode = nodePath.node;
    this.location = this.locationDetector.locationFor(currentNode);
    var enclosingFunc = this.findEnclosingFunction(nodePath);
    this.withinGenerator = enclosingFunc && enclosingFunc.generator;
    this.withinAsync = enclosingFunc && enclosingFunc.async;
    this.generateCanonicalCode(nodePath, currentNode); // should be next to enclosingFunc detection
    // store original espath for each node
    var visitorKeys = this.options.visitorKeys;
    estraverse.traverse(currentNode, {
        keys: visitorKeys,
        enter: function (node) {
            if (this.path()) {
                var espath = this.path().join('/');
                define(node, { _espowerEspath: espath });
            }
        }
    });
};

BabelAssertionVisitor.prototype.enterArgument = function (nodePath) {
    var currentNode = nodePath.node;
    var parentNode = nodePath.parent;
    var argMatchResult = this.matcher.matchArgument(currentNode, parentNode);
    if (!argMatchResult) {
        return;
    }
    if (argMatchResult.name === 'message' && argMatchResult.kind === 'optional') {
        // skip optional message argument
        return;
    }
    this.verifyNotInstrumented(currentNode);
    // create recorder per argument
    this.valueRecorder = this.createNewRecorder(nodePath);
    // entering target argument
    this.currentArgumentNodePath = nodePath;
};

BabelAssertionVisitor.prototype.leave = function (nodePath) {
    var currentNode = nodePath.node;
    var visitorKeys = this.options.visitorKeys;
    estraverse.traverse(currentNode, {
        keys: visitorKeys,
        enter: function (node) {
            delete node._espowerEspath;
        }
    });
};

BabelAssertionVisitor.prototype.leaveArgument = function (resultTree) {
    try {
        return this.argumentModified ? this.captureArgument(resultTree) : resultTree;
    } finally {
        this.currentArgumentNodePath = null;
        this.argumentModified = false;
        this.valueRecorder = null;
    }
};

BabelAssertionVisitor.prototype.captureNode = function (nodePath) {
    var currentNode = nodePath.node;
    var t = this.babel.types;
    this.argumentModified = true;
    var relativeEsPath = currentNode._espowerEspath;
    var newNode = t.callExpression(
        t.memberExpression(this.valueRecorder, t.identifier('_capt')),
        [
            currentNode,
            t.valueToNode(relativeEsPath)
        ]);
    define(newNode, { _generatedByEspower: true });
    return newNode;
};

BabelAssertionVisitor.prototype.toBeSkipped = function (nodePath) {
    return toBeSkipped(this.babel.types, nodePath);
};

BabelAssertionVisitor.prototype.toBeCaptured = function (nodePath) {
    return toBeCaptured(this.babel.types, nodePath);
};

BabelAssertionVisitor.prototype.isArgumentModified = function () {
    return !!this.argumentModified;
};

BabelAssertionVisitor.prototype.isCapturingArgument = function () {
    return !!this.currentArgumentNodePath;
};

BabelAssertionVisitor.prototype.isLeavingAssertion = function (nodePath) {
    return this.assertionNodePath === nodePath;
};

BabelAssertionVisitor.prototype.isLeavingArgument = function (nodePath) {
    return this.currentArgumentNodePath === nodePath;
};

BabelAssertionVisitor.prototype.isGeneratedNode = function (nodePath) {
    var currentNode = nodePath.node;
    return !!currentNode._generatedByEspower;
};

// internal

BabelAssertionVisitor.prototype.generateCanonicalCode = function (nodePath, node) {
    var file = nodePath.hub.file;
    var gen = new babelgen.CodeGenerator(node, { concise: true, comments: false });
    var output = gen.generate();
    this.canonicalCode = output.code;
    if (!this.options.embedAst) {
        return;
    }
    var astAndTokens = this.parseCanonicalCode(file, this.canonicalCode);
    this.ast = JSON.stringify(this.purifyAst(astAndTokens.expression));
    this.tokens = JSON.stringify(astAndTokens.tokens);
    var _this = this;
    var types = this.babel.types;
    this.visitorKeys = this.getOrCreateNode(nodePath, 'powerAssertVisitorKeys', function () {
        return types.stringLiteral(JSON.stringify(_this.options.visitorKeys));
    });
};

BabelAssertionVisitor.prototype.parseCanonicalCode = function (file, code) {
    var ast, tokens;

    function doParse(wrapper) {
        var content = wrapper ? wrapper(code) : code;
        var output = file.parse(content);
        if (wrapper) {
            ast = output.program.body[0].body;
            tokens = output.tokens.slice(6, -2);
        } else {
            ast = output.program;
            tokens = output.tokens.slice(0, -1);
        }
    }

    if (this.withinAsync) {
        doParse(wrappedInAsync);
    } else if (this.withinGenerator) {
        doParse(wrappedInGenerator);
    } else {
        doParse();
    }

    var exp = ast.body[0].expression;
    var columnOffset = exp.loc.start.column;
    var offsetTree = estraverse.replace(exp, {
        keys: this.options.visitorKeys,
        enter: function (eachNode) {
            eachNode.range = [
                eachNode.loc.start.column - columnOffset,
                eachNode.loc.end.column - columnOffset
            ];
            delete eachNode.loc;
            return eachNode;
        }
    });

    return {
        tokens: offsetAndSlimDownTokens(tokens),
        expression: offsetTree
    };
};

function wrappedInGenerator (jsCode) {
    return 'function *wrapper() { ' + jsCode + ' }';
}

function wrappedInAsync (jsCode) {
    return 'async function wrapper() { ' + jsCode + ' }';
}

function offsetAndSlimDownTokens (tokens) {
    var i, token, newToken, result = [];
    var columnOffset;
    for(i = 0; i < tokens.length; i += 1) {
        token = tokens[i];
        if (i === 0) {
            columnOffset = token.loc.start.column;
        }
        newToken = {
            type: {
                label: token.type.label
            }
        };
        if (typeof token.value !== 'undefined') {
            newToken.value = token.value;
        }
        newToken.range = [
            token.loc.start.column - columnOffset,
            token.loc.end.column - columnOffset
        ];
        result.push(newToken);
    }
    return result;
}

BabelAssertionVisitor.prototype.captureArgument = function (node) {
    var t = this.babel.types;
    var props = {
        content: this.canonicalCode,
        filepath: this.location.source,
        line: this.location.line
    };
    if (this.withinAsync) {
        props.async = true;
    }
    if (this.withinGenerator) {
        props.generator = true;
    }
    if (this.ast) {
        props.ast = this.ast;
    }
    if (this.tokens) {
        props.tokens = this.tokens;
    }
    var propsNode = t.valueToNode(props);
    if (this.visitorKeys) {
        var visitorKeysNode = t.objectProperty(t.identifier('visitorKeys'), this.visitorKeys);
        propsNode.properties.push(visitorKeysNode);
    }
    var newNode = t.callExpression(
        t.memberExpression(this.valueRecorder, t.identifier('_expr')),
        [
            node,
            propsNode
        ]
    );
    define(newNode, { _generatedByEspower: true });
    return newNode;
};

BabelAssertionVisitor.prototype.verifyNotInstrumented = function (currentNode) {
    var types = this.babel.types;
    if (!types.isCallExpression(currentNode)) {
        return;
    }
    if (!types.isMemberExpression(currentNode.callee)) {
        return;
    }
    var prop = currentNode.callee.property;
    if (types.isIdentifier(prop) && prop.name === '_expr') {
        var errorMessage = '[espower] Attempted to transform AST twice.';
        if (this.options.path) {
            errorMessage += ' path: ' + this.options.path;
        }
        throw new Error(errorMessage);
    }
};

BabelAssertionVisitor.prototype.createNewRecorder = function (nodePath) {
    var _this = this;
    var types = this.babel.types;
    var helperNameNode = this.getOrCreateNode(nodePath, 'powerAssertRecorder', function () {
        return types.toExpression(_this.helperTemplate());
    });
    var recorderIdent = nodePath.scope.generateUidIdentifier('rec');
    define(recorderIdent, { _generatedByEspower: true });
    var init = types.newExpression(helperNameNode, []);
    define(init, { _generatedByEspower: true });
    nodePath.scope.push({ id: recorderIdent, init: init });
    return recorderIdent;
};

BabelAssertionVisitor.prototype.getOrCreateNode = function (nodePath, keyName, generateNode) {
    var file = nodePath.hub.file;
    var ident = file.get(keyName);
    if (!ident) {
        ident = this.createNode(nodePath, keyName, generateNode);
        // helperNameNode = file.addImport('power-assert-runtime/recorder', 'default', 'recorder');
    }
    return ident;
};

BabelAssertionVisitor.prototype.createNode = function (nodePath, keyName, generateNode) {
    var file = nodePath.hub.file;
    var programScope = nodePath.scope.getProgramParent();
    var ident = programScope.generateUidIdentifier(keyName);
    define(ident, { _generatedByEspower: true });
    file.set(keyName, ident);
    var generatedNode = generateNode();
    var visitorKeys = this.options.visitorKeys;
    estraverse.traverse(generatedNode, {
        keys: visitorKeys,
        enter: function (node) {
            define(node, { _generatedByEspower: true });
        }
    });
    generatedNode._compact = true;
    programScope.push({ id: ident, init: generatedNode });
    return ident;
};

BabelAssertionVisitor.prototype.findEnclosingFunction = function (nodePath) {
    if (!nodePath) {
        return null;
    }
    if (this.babel.types.isFunction(nodePath.node)) {
        return nodePath.node;
    }
    return this.findEnclosingFunction(nodePath.parentPath);
};

module.exports = BabelAssertionVisitor;
