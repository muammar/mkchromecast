'use strict';

module.exports = function defineProperties (obj, map) {
    Object.keys(map).forEach(function (name) {
        Object.defineProperty(obj, name, {
            configurable: true,
            enumerable: false,
            value: map[name],
            writable: true
        });
    });
};
