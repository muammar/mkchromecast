seedrandom.js
=============
[![Build Status](https://travis-ci.org/davidbau/seedrandom.svg?branch=master)](https://travis-ci.org/davidbau/seedrandom)
[![NPM version](https://badge.fury.io/js/seedrandom.svg)](http://badge.fury.io/js/seedrandom)
[![Bower version](https://badge.fury.io/bo/seedrandom.svg)](http://badge.fury.io/bo/seedrandom)

Seeded random number generator for Javascript.

version 2.3.11<br>
Author: David Bau<br>
Date: 2014 Dec 11

Can be used as a plain script, a node.js module or an AMD module.


Script tag usage
----------------

<pre>
&lt;script src=//cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.11/seedrandom.min.js&gt;
&lt;/script&gt;
</pre>

<pre>
// Sets Math.random to a PRNG initialized using the given explicit seed.
Math.seedrandom('hello.');
console.log(Math.random());          // Always 0.9282578795792454
console.log(Math.random());          // Always 0.3752569768646784

// Sets Math.random to an ARC4-based PRNG that is autoseeded using the
// current time, dom state, and other accumulated local entropy.
// The generated seed string is returned.
Math.seedrandom();
console.log(Math.random());          // Reasonably unpredictable.

// Seeds using the given explicit seed mixed with accumulated entropy.
Math.seedrandom('added entropy.', { entropy: true });
console.log(Math.random());          // As unpredictable as added entropy.

// Use "new" to create a local prng without altering Math.random.
var myrng = new Math.seedrandom('hello.');
console.log(myrng());                // Always 0.9282578795792454
</pre>


Node.js usage
-------------

<pre>
npm install seedrandom
</pre>

<pre>
// Local PRNG: does not affect Math.random.
var seedrandom = require('seedrandom');
var rng = seedrandom('hello.');
console.log(rng());                  // Always 0.9282578795792454

// Global PRNG: set Math.random.
seedrandom('hello.', { global: true });
console.log(Math.random());          // Always 0.9282578795792454

// Autoseeded ARC4-based PRNG.
rng = seedrandom();
console.log(rng());                  // Reasonably unpredictable.

// Mixing accumulated entropy.
rng = seedrandom('added entropy.', { entropy: true });
console.log(rng());                  // As unpredictable as added entropy.
</pre>


Require.js usage
----------------

Similar to node.js usage:

<pre>
bower install seedrandom
</pre>

<pre>
require(['seedrandom'], function(seedrandom) {
  var rng = seedrandom('hello.');
  console.log(rng());                  // Always 0.9282578795792454
});
</pre>


Network seeding
---------------

<pre>
&lt;script src=//cdnjs.cloudflare.com/ajax/libs/seedrandom/2.3.11/seedrandom.min.js&gt;
&lt;/script&gt;
&lt;!-- Seeds using urandom bits from a server. --&gt;
&lt;script src=//jsonlib.appspot.com/urandom?callback=Math.seedrandom"&gt;
&lt;/script&gt;

&lt;!-- Seeds mixing in random.org bits --&gt;
&lt;script&gt;
(function(x, u, s){
  try {
    // Make a synchronous request to random.org.
    x.open('GET', u, false);
    x.send();
    s = unescape(x.response.trim().replace(/^|\s/g, '%'));
  } finally {
    // Seed with the response, or autoseed on failure.
    Math.seedrandom(s, !!s);
  }
})(new XMLHttpRequest, 'https://www.random.org/integers/' +
  '?num=256&min=0&max=255&col=1&base=16&format=plain&rnd=new');
&lt;/script&gt;
</pre>

Reseeding using user input
--------------------------

<pre>
var seed = Math.seedrandom();        // Use prng with an automatic seed.
document.write(Math.random());       // Pretty much unpredictable x.

var rng = new Math.seedrandom(seed); // A new prng with the same seed.
document.write(rng());               // Repeat the 'unpredictable' x.

function reseed(event, count) {      // Define a custom entropy collector.
  var t = [];
  function w(e) {
    t.push([e.pageX, e.pageY, +new Date]);
    if (t.length &lt; count) { return; }
    document.removeEventListener(event, w);
    Math.seedrandom(t, { entropy: true });
  }
  document.addEventListener(event, w);
}
reseed('mousemove', 100);            // Reseed after 100 mouse moves.
</pre>

The "pass" option can be used to get both the prng and the seed.
The following returns both an autoseeded prng and the seed as an object,
without mutating Math.random:

<pre>
var obj = Math.seedrandom(null, { pass: function(prng, seed) {
  return { random: prng, seed: seed };
}});
</pre>


Saving and Restoring PRNG state
-------------------------------

<pre>
var seedrandom = Math.seedrandom;
var saveable = seedrandom("secret-seed", {state: true});
for (var j = 0; j &lt; 1e5; ++j) saveable();
var saved = saveable.state();
var replica = seedrandom("", {state: saved});
assert(replica() == saveable());
</pre>

In normal use the prng is opaque and its internal state cannot be accessed.
However, if the "state" option is specified, the prng gets a state() method
that returns a plain object the can be used to reconstruct a prng later in
the same state (by passing that saved object back as the state option).


Version notes
-------------

The random number sequence is the same as version 1.0 for string seeds.

* Version 2.0 changed the sequence for non-string seeds.
* Version 2.1 speeds seeding and uses window.crypto to autoseed if present.
* Version 2.2 alters non-crypto autoseeding to sweep up entropy from plugins.
* Version 2.3 adds support for "new", module loading, and a null seed arg.
* Version 2.3.1 adds a build environment, module packaging, and tests.
* Version 2.3.4 fixes bugs on IE8, and switches to MIT license.
* Version 2.3.6 adds a readable options object argument.
* Version 2.3.10 adds support for node.js crypto (contributed by ctd1500).
* Version 2.3.11 adds an option to load and save internal state.

The standard ARC4 key scheduler cycles short keys, which means that
seedrandom('ab') is equivalent to seedrandom('abab') and 'ababab'.
Therefore it is a good idea to add a terminator to avoid trivial
equivalences on short string seeds, e.g., Math.seedrandom(str + '\0').
Starting with version 2.0, a terminator is added automatically for
non-string seeds, so seeding with the number 111 is the same as seeding
with '111\0'.

When seedrandom() is called with zero args or a null seed, it uses a
seed drawn from the browser crypto object if present.  If there is no
crypto support, seedrandom() uses the current time, the native rng,
and a walk of several DOM objects to collect a few bits of entropy.

Each time the one- or two-argument forms of seedrandom are called,
entropy from the passed seed is accumulated in a pool to help generate
future seeds for the zero- and two-argument forms of seedrandom.

On speed - This javascript implementation of Math.random() is several
times slower than the built-in Math.random() because it is not native
code, but that is typically fast enough.  Some details (timings on
Chrome 25 on a 2010 vintage macbook):

* seeded Math.random()          - avg less than 0.0002 milliseconds per call
* seedrandom('explicit.')       - avg less than 0.2 milliseconds per call
* seedrandom('explicit.', true) - avg less than 0.2 milliseconds per call
* seedrandom() with crypto      - avg less than 0.2 milliseconds per call

Autoseeding without crypto is somewhat slower, about 20-30 milliseconds on
a 2012 windows 7 1.5ghz i5 laptop, as seen on Firefox 19, IE 10, and Opera.
Seeded rng calls themselves are fast across these browsers, with slowest
numbers on Opera at about 0.0005 ms per seeded Math.random().


LICENSE (MIT)
-------------

Copyright 2014 David Bau.

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

