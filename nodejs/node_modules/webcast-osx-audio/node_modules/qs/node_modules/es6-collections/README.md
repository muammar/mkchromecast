ES6 Harmony Collections [![build status](https://secure.travis-ci.org/WebReflection/es6-collections.png)](http://travis-ci.org/WebReflection/es6-collections)
===========================================


[![browser support](https://ci.testling.com/WebReflection/es6-collections.png)
](https://ci.testling.com/WebReflection/es6-collections)


The aim of this repository is to provide an **unobtrusive, performances oriented** shim for ES6 collections such **WeakMap**, **Map**, and **Set**.

These global functions are already available in Firefox Nightly and Chrome Dev channel through *Enable Experimental JavaScript* in *chrome://flags/* section.


Features
--------
  * compatible with **all browsers** and both **node.js** (`npm install es6-collections`) and **Rhino**
  * **100% unobtrusive** with any environment. If implemented in node V8 it exports native constructors rather than shims
  * **size and performances oriented** polyfill. It does not matter if the WeakMap is not perfect, it's just fast and not much more memory leaks prone than other shims. If you don't rely on magic, simply remember to `weakmap.delete(referedObject)` when *referedObject* is not needed anymore.
  * for browsers, it fits in **less than 1Kb** [once minzipped](https://github.com/WebReflection/es6-collections/blob/master/es6-collections.js) ... the smallest shim out there so far
  * 100% of code coverage
  * completely private shared behavior in order to easily maintain and update three collections at once


New On Version 0.3.0
--------------------
  * API updated to the [MDN docs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map)
  * tests are replaced with mocha and testling, which gets testling table and better testing possibilities
  * polyfills for old browsers moved out to autopolyfiller
  * used prototypical shared methods approach since it demonstrates times better results - [test on jsperf](http://jsperf.com/object-create-method-vs-prototype-method)

New On Version 0.2.0
--------------------
  * **removed** both **keys** and **values** properties since these are not in specs anymore
  * improved checks in order to do not fail with **NaN** or **-0** and **+0** as specified via specs
  * native Array.prototype.indexOf used when key/value to retrieve is not **NaN** or **-0** and **+0** (performances regardless checks)
  * updated **tests** including all methods behaviors plus `(Map|Set)#size()` test for **Mozilla only**


The WeakMap Is Not Weak ... And Why
-----------------------------------
  * first of all, **ES6 Collections is not about WeakMap only** ... most likely is about **Map** ... anyway ...
  * **O(n)** against **O(1)** to link *keyObject* and value is a **no-go** for different reasons:
    * the random property attached to the object will be easily discoverable via *for/in* loop in all non ES5 capable engines, **obtrusive**
    * even in ES5 capable browser, to make the random property not discoverable we need to wrap native *Object.defineProperty*, *Object.defineProperties*, *Object.create*, *Object.getOwnPropertyNames*, plus eventually *Proxy*, which means the whole application will be **O(n) times slower for everything**, not Map or WeakMap only
    * there are **situations where a random property cannot be attached**, as example in Internet Explorer some object exposed in JavaScript may not accept runtime attached properties. The purpose of this shim is to be as cross platform as possible and **as safe as possible while others polyfills are able to break**, just as example, objects defined via [VB Classes](http://code.google.com/p/vbclass/)
  * it's simply not possible to create 100% WeakMap in ES5 only, the aim of this polyfill is to bring a 1:1 unobtrusive and reliable API rather than 1:1 implementation
  * if you think WeakMap, never existed until now, is the only thing you need, you may consider the first proposed alternative and simply walk away from this page
  * a polyfill aim is to bring a reliable API until the browser supports it and you can simply remove the polyfill dependency. The perfect implementation may be unnecessary, in this case obtrusive, or simply [YAGNI](http://en.wikipedia.org/wiki/You_ain't_gonna_need_it)


Alternatives
------------
  * the bigger and rich in dependencies [WeakMap shim from Mark S. Miller](http://code.google.com/p/es-lab/source/browse/trunk/src/ses/WeakMap.js), the best attempt to avoid undesired memory leaks. Bear in mind some leak is still possible plus *Object* natives are wrapped plus it brings WeakMap only
  * the unfortunately and so far slower and heavier, memory usage speaking, alternative from [Benvie Harmony Collections Shim](https://github.com/Benvie/ES6-Harmony-Collections-Shim)
  * differently implemented Map and Set (no WeakMap) from [Paul Millr](https://github.com/paulmillr/es6-shim), together with few others ES6 prototypes
  * another attempt based on valueOf to avoid IE enumerability, still problematic with *unknown* objects but less leaks prone from [Gozala](https://gist.github.com/1269991)


Tests
-----
Just type `$ mocha` or `$ npm test` from the project’s folder in terminal.


Build
-----
`$ npm build` to build browser version of bundle.


License
-------

*es6-collections* and the rest of the project is under Mit Style License

    Copyright (C) 2011 by Andrea Giammarchi, @WebReflection

    Permission is hereby granted, free of charge, to any person obtaining a copy
    of this software and associated documentation files (the "Software"), to deal
    in the Software without restriction, including without limitation the rights
    to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
    copies of the Software, and to permit persons to whom the Software is
    furnished to do so, subject to the following conditions:

    The above copyright notice and this permission notice shall be included in
    all copies or substantial portions of the Software.

    THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
    IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
    FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
    AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
    LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
    OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
    THE SOFTWARE.
