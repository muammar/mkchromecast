'use strict';

var defaultOptions = require('./default-options');
var assign = require('core-js/library/fn/object/assign');
var BabelEspowerVisitor = require('./babel-espower-visitor');

module.exports = function createEspowerVisitor (babel, options) {
    return {
        visitor: {
            Program: function (path, state) {
                var opts = assign(defaultOptions(), {
                    astWhiteList: babel.types.BUILDER_KEYS,
                    visitorKeys: babel.types.VISITOR_KEYS,
                    sourceRoot: process.cwd()
                }, options, state.opts);
                var espowerVisitor = new BabelEspowerVisitor(babel, opts);
                var innerVisitor = Object.keys(opts.visitorKeys).reduce(function (handlers, nodeType) {
                    handlers[nodeType] = {
                        enter: function (nodePath, pluginPass) {
                            espowerVisitor.enter(nodePath);
                        },
                        exit: function (nodePath, pluginPass) {
                            espowerVisitor.exit(nodePath);
                        }
                    };
                    return handlers;
                }, {});
                path.traverse(innerVisitor, state);
            }
        }
    };
};
