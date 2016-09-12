/**
 * babel-plugin-espower:
 *   Babel plugin for power-assert
 * 
 * https://github.com/power-assert-js/babel-plugin-espower
 *
 * Copyright (c) 2015-2016 Takuto Wada
 * Licensed under the MIT license.
 *   https://twada.mit-license.org/2015-2016
 */
'use strict';

var createEspowerPlugin = require('./create');

module.exports = function (babel) {
    return createEspowerPlugin(babel);
};
