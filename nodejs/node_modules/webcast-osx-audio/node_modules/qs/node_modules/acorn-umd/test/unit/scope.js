import {parse} from 'acorn';
import umd from '../../src/acorn-umd';

describe('Determining node scope', function() {
    let code = `
        var assert = require('assert');
        function test() {
            var x = require('foo');
        }
    `;

    let ast = parse(code, {ecmaVersion: 6, sourceType: 'module'});
    let imports = umd(ast, {
        es6: false, amd: false, cjs: true
    });

    describe('(CJS)', function() {
        it('deterines global scope', function() {
            expect(imports[0]).to.have.property('scope').and.be.property('type', 'global');
        });

        it('deterines function scope', function() {
            expect(imports[1]).to.have.property('scope').and.not.be.property('type', 'FunctionExpression');
        });
    });
});
