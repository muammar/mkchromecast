// test the polyfill
(this.window || global).Map = undefined;
(this.window || global).Set = undefined;
(this.window || global).WeakMap = undefined;
(this.window || global).WeakSet = undefined;


var assert = require('better-assert');
// require('../index');
require('../es6-collections');

describe('ES Collections test', function(){
  it("WeakMap existence", function () {
    assert(WeakMap);
  });

  it("WeakMap constructor behavior", function () {
    assert(new WeakMap instanceof WeakMap);
    assert(new WeakMap() instanceof WeakMap);
    var a = {};
    var b = {};
    var c = new WeakMap();
    var m = new WeakMap([[a,1], [b,2], [c, 3]]);
    assert(m.has(a));
    assert(m.has(b));
    assert(m.has(c));
    if ("__proto__" in {}) {
      assert((new WeakMap).__proto__.isPrototypeOf(new WeakMap()));
      assert((new WeakMap).__proto__ === WeakMap.prototype);
    }
  });

  it("WeakMap#has", function () {
    var
      o = new WeakMap(),
      generic = {},
      callback = function () {}
    ;
    assert(false === o.has(callback));
    o.set(callback, generic);
    assert(true === o.has(callback));
  });

  it("WeakMap#get", function () {
    var
      o = new WeakMap(),
      generic = {},
      callback = function () {}
    ;
    //:was assert(o.get(callback, 123) === 123);
    o.set(callback, generic);
    assert(o.get(callback, 123) === generic);
    assert(o.get(callback) === generic);
  });

  it("WeakMap#set", function () {
    var
      o = new WeakMap(),
      generic = {},
      callback = function () {}
    ;
    o.set(callback, generic);
    assert(o.get(callback) === generic);
    o.set(callback, callback);
    assert(o.get(callback) === callback);
    o.set(callback, o);
    assert(o.get(callback) === o);
    o.set(o, callback);
    assert(o.get(o) === callback);
  });

  it("WeakMap#['delete']", function () {
    var
      o = new WeakMap(),
      generic = {},
      callback = function () {}
    ;
    o.set(callback, generic);
    o.set(generic, callback);
    o.set(o, callback);
    assert(o.has(callback) && o.has(generic) && o.has(o));
    o["delete"](callback);
    o["delete"](generic);
    o["delete"](o);
    assert(!o.has(callback) && !o.has(generic) && !o.has(o));
    assert(o["delete"](o) === false);
    o.set(o, callback);
    assert(o["delete"](o));
  });

  it("non object key throws an error", function () {
    var o = new WeakMap();
    try {
      o.set("key", o);
      assert(false);
    } catch(emAll) {
      assert(true);
    }
  });

  it("Map existence", function () {
    assert(Map);
  });

  it("Map constructor behavior", function () {
    assert(new Map instanceof Map);
    assert(new Map() instanceof Map);
    var a = 1;
    var b = {};
    var c = new Map();
    var m = new Map([[1,1], [b,2], [c, 3]]);
    assert(m.has(a));
    assert(m.has(b));
    assert(m.has(c));
    assert(m.size, 3);
    if ("__proto__" in {}) {
      assert((new Map).__proto__.isPrototypeOf(new Map()));
      assert((new Map).__proto__ === Map.prototype);
    }
  });

  it("Map#size - Mozilla only", function () {
    var
      o = new Map()
    ;
    if ("size" in o) {
      assert(o.size === 0);
      o.set("a", "a");
      assert(o.size === 1);
      o["delete"]("a");
      assert(o.size === 0);
    }
  });

  it("Map#has", function () {
    var
      o = new Map(),
      generic = {},
      callback = function () {}
    ;
    assert(false === o.has(callback));
    o.set(callback, generic);
    assert(true === o.has(callback));
  });

  it("Map#get", function () {
    var
      o = new Map(),
      generic = {},
      callback = function () {}
    ;
    //:was assert(o.get(callback, 123) === 123);
    o.set(callback, generic);
    assert(o.get(callback, 123) === generic);
    assert(o.get(callback) === generic);
  });

  it("Map#set", function () {
    var
      o = new Map(),
      generic = {},
      callback = function () {}
    ;
    o.set(callback, generic);
    assert(o.get(callback) === generic);
    o.set(callback, callback);
    assert(o.get(callback) === callback);
    o.set(callback, o);
    assert(o.get(callback) === o);
    o.set(o, callback);
    assert(o.get(o) === callback);
    o.set(NaN, generic);
    assert(o.has(NaN));
    assert(o.get(NaN) === generic);
    o.set("key", undefined);
    assert(o.has("key"));
    assert(o.get("key") === undefined);

    assert(!o.has(-0));
    assert(!o.has(0));
    o.set(-0, callback);
    assert(o.has(-0));
    assert(o.has(0));
    assert(o.get(-0) === callback);
    assert(o.get(0) === callback);
    o.set(0, generic);
    assert(o.has(-0));
    assert(o.has(0));
    assert(o.get(-0) === generic);
    assert(o.get(0) === generic);
  });

  it("Map#['delete']", function () {
    var
      o = new Map(),
      generic = {},
      callback = function () {}
    ;
    o.set(callback, generic);
    o.set(generic, callback);
    o.set(o, callback);
    assert(o.has(callback) && o.has(generic) && o.has(o));
    o["delete"](callback);
    o["delete"](generic);
    o["delete"](o);
    assert(!o.has(callback) && !o.has(generic) && !o.has(o));
    assert(o["delete"](o) === false);
    o.set(o, callback);
    assert(o["delete"](o));
  });

  it("non object key does not throw an error", function () {
    var o = new Map();
    try {
      o.set("key", o);
      assert(true);
    } catch(emAll) {
      assert(false);
    }
  });

  it("keys, values, entries behavior", function () {
    // test that things get returned in insertion order as per the specs
    var o = new Map([["1", 1], ["2", 2], ["3", 3]]);
    var keys = o.keys(), values = o.values();
    var k = keys.next(), v = values.next();
    assert(k.value === "1" && v.value === 1);
    o.delete("2");
    k = keys.next(), v = values.next();
    assert(k.value === "3" && v.value === 3);
    // insertion of previously-removed item goes to the end
    o.set("2", 2);
    k = keys.next(), v = values.next();
    assert(k.value === "2" && v.value === 2);
    // when called again, new iterator starts from beginning
    var entriesagain = o.entries();
    assert(entriesagain.next().value[0] === "1");
    assert(entriesagain.next().value[0] === "3");
    assert(entriesagain.next().value[0] === "2");
    // after a iterator is finished, don't return any more elements
    k = keys.next(), v = values.next();
    assert(k.done && v.done);
    k = keys.next(), v = values.next();
    assert(k.done && v.done);
    o.set("4", 4);
    k = keys.next(), v = values.next();
    assert(k.done && v.done);
    // new element shows up in iterators that didn't yet finish
    assert(entriesagain.next().value[0] === "4");
    assert(entriesagain.next().done);
  });

  it("Map#forEach", function () {
    var o = new Map(), i;
    o.set("key 0", 0);
    o.set("key 1", 1);
    if ("forEach" in o) {
      o.forEach(function (value, key, obj) {
        assert(key === "key " + value);
        assert(obj === o);
        // even if dropped, keeps looping
        o["delete"](key);
      });
      assert(!o.size);
    }
  });

  it("Map#forEach with mutations", function () {
    var o = new Map([["0", 0], ["1", 1], ["2", 2]]), seen = [];
    o.forEach(function (value, key, obj) {
      seen.push(value);
      assert(obj === o);
      assert(""+value === key);
      // mutations work as expected
      if (value === 1) {
        o.delete("0"); // remove from before current index
        o.delete("2"); // remove from after current index
        o.set("3", 3); // insertion
      } else if (value === 3) {
        o.set("0", 0); // insertion at the end
      }
    });
    assert(JSON.stringify(seen) === JSON.stringify([0, 1, 3, 0]));
    assert(JSON.stringify(o._values) === JSON.stringify([1, 3, 0]));
  });

  it("Map#clear", function(){
    var o = new Map();
    o.set(1, '1');
    o.set(2, '2');
    o.set(3, '3');
    o.clear();
    assert(!o.size);
  });

  it("Set existence", function () {
    assert(Set);
  });

  it("Set constructor behavior", function () {
    assert(new Set instanceof Set);
    assert(new Set() instanceof Set);
    var s = new Set([1,2]);
    assert(s.has(1));
    assert(s.has(2));
    assert(s.size, 2);
    if ("__proto__" in {}) {
      assert((new Set).__proto__.isPrototypeOf(new Set()));
      assert((new Set).__proto__ === Set.prototype);
    }
  });

  it("Set#size - Mozilla only", function () {
    var
      o = new Set()
    ;
    if ("size" in o) {
      assert(o.size === 0);
      o.add("a");
      assert(o.size === 1);
      o["delete"]("a");
      assert(o.size === 0);
    }
  });

  it("Set#add", function () {
    var o = new Set();
    assert(o.add(NaN));
    assert(o.has(NaN));
  });

  it("Set#['delete']", function () {
    var
      o = new Set(),
      generic = {},
      callback = function () {}
    ;
    o.add(callback);
    o.add(generic);
    o.add(o);
    assert(o.has(callback) && o.has(generic) && o.has(o));
    o["delete"](callback);
    o["delete"](generic);
    o["delete"](o);
    assert(!o.has(callback) && !o.has(generic) && !o.has(o));
    assert(o["delete"](o) === false);
    o.add(o);
    assert(o["delete"](o) === true);
  });

  it("values behavior", function () {
    // test that things get returned in insertion order as per the specs
    var o = new Set([1, 2, 3]);
    assert(o.keys === o.values); // same function, as per the specs
    var values = o.values();
    var v = values.next();
    assert(v.value === 1);
    o.delete(2);
    v = values.next();
    assert(v.value === 3);
    // insertion of previously-removed item goes to the end
    o.add(2);
    v = values.next();
    assert(v.value === 2);
    // when called again, new iterator starts from beginning
    var entriesagain = o.entries();
    assert(entriesagain.next().value[1] === 1);
    assert(entriesagain.next().value[1] === 3);
    assert(entriesagain.next().value[1] === 2);
    // after a iterator is finished, don't return any more elements
    v = values.next();
    assert(v.done);
    v = values.next();
    assert(v.done);
    o.add(4);
    v = values.next();
    assert(v.done);
    // new element shows up in iterators that didn't yet finish
    assert(entriesagain.next().value[1] === 4);
    assert(entriesagain.next().done);
  });

  it("Set#has", function () {
    var
      o = new Set(),
      generic = {},
      callback = function () {}
    ;
    assert(false === o.has(callback));
    o.add(callback);
    assert(true === o.has(callback));
  });

  it("Set#forEach", function () {
    var o = new Set(), i = 0;
    o.add("value 0");
    o.add("value 1");
    if ("forEach" in o) {
      o.forEach(function (value, sameValue, obj) {
        assert(value === "value " + i++);
        assert(obj === o);
        assert(value === sameValue);
        // even if dropped, keeps looping
        o["delete"](value);
      });
      assert(!o.size);
    }
  });

  it("Set#forEach with mutations", function () {
    var o = new Set([0, 1, 2]), seen = [];
    o.forEach(function (value, sameValue, obj) {
      seen.push(value);
      assert(obj === o);
      assert(value === sameValue);
      // mutations work as expected
      if (value === 1) {
        o.delete(0); // remove from before current index
        o.delete(2); // remove from after current index
        o.add(3); // insertion
      } else if (value === 3) {
        o.add(0); // insertion at the end
      }
    });
    assert(JSON.stringify(seen) === JSON.stringify([0, 1, 3, 0]));
    assert(JSON.stringify(o._values) === JSON.stringify([1, 3, 0]));
  });

  it("Set#clear", function(){
    var o = new Set();
    o.add(1);
    o.add(2);
    o.clear();
    assert(!o.size);
  });

  it("WeakSet existence", function () {
    assert(WeakSet);
  });

  it("WeakSet constructor behavior", function () {
    assert(new WeakSet instanceof WeakSet);
    assert((new WeakSet) instanceof WeakSet);
    var a = {}, b = {};
    var s = new WeakSet([a, b]);
    assert(s.has(a) && s.has(b));
    if ("__proto__" in {}) {
      assert((new WeakSet).__proto__.isPrototypeOf(new WeakSet()));
      assert((new WeakSet).__proto__ === WeakSet.prototype);
    }
  });

  it("Set#add, WeakSet#add, Map#set and WeakMap#set are chainable now", function(){
    var s = new Set();
    var ws = new WeakSet();
    var m = new Map();
    var wm = new WeakMap();
    var a = {}, b = {};

    s.add(1).add(2);
    assert(s.has(1) && s.has(2) && s.size === 2);

    ws.add(a).add(b);
    assert(ws.has(a) && ws.has(b));

    m.set(1, 1).set(a, 2);
    assert(m.has(1) && m.has(a) && m.size === 2);

    wm.set(a, b).set(b, a);
    assert(wm.get(a) === b && wm.get(b) === a);
  });

  it("Recognize any iterable as the constructor input", function(){
    var a = new Set(new Set([1,2]));
    assert(a.has(1));
  });
});
