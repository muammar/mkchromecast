'use strict';

var createEspowerVisitor = require('./lib/create-espower-visitor');

module.exports = function createEspowerPlugin (babel, options) {
    return createEspowerVisitor(babel, options);
};
