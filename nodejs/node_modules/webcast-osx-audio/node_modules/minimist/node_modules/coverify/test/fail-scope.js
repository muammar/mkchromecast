function test() {
    return this;
}
var scope = {};
var value = test.call(scope);
if (scope !== value) {
    throw new Error('Wrong scope');
}
