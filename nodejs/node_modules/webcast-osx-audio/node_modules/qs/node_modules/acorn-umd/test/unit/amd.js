import {parse} from 'acorn';
import umd from '../../src/acorn-umd';

describe('Parsing AMD define import nodes', function() {
    describe('common case', function() {
        let code = `
            foo();
            define(['foo', 'bar', 'twat', 'unused-import'], function(foo, bar, $) {
                return foo();
            });
        `;

        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('AMD identifies multiple variables', function() {
            expect(parsed).to.have.length(1);
        });

        it('has the correct specifiers,imports&sources', function() {
            let {specifiers, imports, sources} = parsed[0];
            expect(imports).to.have.length(4);
            expect(sources).to.have.length(4);
            expect(specifiers).to.have.length(3);
        });

        it('sources are zipped correctly', function() {
            [['foo', 'foo'], ['bar', 'bar'], ['twat', '$'], ['unused-import']].forEach((pair, i) => {
                let cpair = parsed[0].imports[i];
                expect(cpair[0]).to.have.property('value', pair[0]);
                expect(cpair[0]).to.have.property('raw', `'${pair[0]}'`);
                if (pair.length > 1) {
                    expect(cpair[1]).to.have.property('name', pair[1]);
                } else {
                    expect(cpair[1]).to.be.undefined;
                }
            });
        });
    });

    describe('ES6 style', function() {
        let code = `
            define(['foo', 'bar', 'twat', 'unused-import'], (foo, bar, $) => {
                return foo();
            });
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('AMD identifies multiple variables', function() {
            expect(parsed).to.have.length(1);
        });
    });

    describe('AMD works with global declaration with imports', function() {
        let code = `
            define(['smt'], 'global', function(smt) {return null;});
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('has the correct length', function() {
            expect(parsed).to.have.length(1);
        });

        it('has the correct specifiers,imports&sources', function() {
            let {specifiers, imports, sources} = parsed[0];
            expect(imports).to.have.length(1);
            expect(sources).to.have.length(1);
            expect(specifiers).to.have.length(1);
        });
    });

    describe('AMD identifies no variables', function() {
        let code = `
            define(function() {return null;});
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('has the correct length', function() {
            expect(parsed).to.be.length(1);
        });

        it('has the correct specifiers,imports&sources', function() {
            let {specifiers, imports, sources} = parsed[0];
            expect(imports).to.be.empty;
            expect(sources).to.be.empty;
            expect(specifiers).to.be.empty;
        });
    });

    describe('AMD identifies with gllobal declaration & no variables', function() {
        let code = `
            define('global', function() {return null;});
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('has the correct length', function() {
            expect(parsed).to.be.length(1);
        });

        it('has the correct specifiers,imports&sources', function() {
            let {specifiers, imports, sources} = parsed[0];
            expect(imports).to.be.empty;
            expect(sources).to.be.empty;
            expect(specifiers).to.be.empty;
        });
    });

    describe('with multiple declarations in a file', function() {
        let code = `
            define('foo', function() {return 5});
            define(['foo', 'x'], 'bar', function(foo, x) {
                return x + foo;
            });
            define(['bar', 'unused-import'], function(bar) {
                return Math.pow(bar, 2);
            });
        `;
        let ast = parse(code, {ecmaVersion: 6});
        let parsed = umd(ast, {
            es6: false, amd: true, cjs: false
        });

        it('finds all defines with imports', function() {
            expect(parsed).to.have.length(3);
        });

        it('Global no vars parsed correctly', function() {
            let {specifiers, imports, sources} = parsed[0];
            expect(imports).to.be.empty;
            expect(sources).to.be.empty;
            expect(specifiers).to.be.empty;
        });

        it('Global with imports parsed correctly', function() {
            let {specifiers, imports, sources} = parsed[1];
            expect(imports).to.have.length(2);
            expect(sources).to.have.length(2);
            expect(specifiers).to.have.length(2);
        });

        it('Anon with imports parsed correctly', function() {
            let {specifiers, imports, sources} = parsed[2];
            expect(imports).to.have.length(2);
            expect(sources).to.have.length(2);
            expect(specifiers).to.have.length(1);
        });
    });
});
