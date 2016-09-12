'use strict'

var bufferEquals = require('buffer-equals')

function isArguments (object) {
  return Object.prototype.toString.call(object) === '[object Arguments]'
}

module.exports = shallower

function shallower (a, b) {
  return shallower_(a, b, [], [])
}

/**
 * Based on `only-shallow` by @othiym23. The comments are mostly his, edited
 * to reflect the usage of strict equality.
 *
 * This is a structural equality test, modeled on bits and pieces of loads of
 * other implementations of this algorithm, most notably the much stricter
 * `deeper`, from which this comment was copied.
 *
 * Everybody who writes one of these functions puts the documentation
 * inline, which makes it incredibly hard to follow. Here's what this version
 * of the algorithm does, in order:
 *
 * 1. Use strict equality (`===`).
 * 2. `null` *is* an object – a singleton value object, in fact – so if
 *    either is `null`, return a === b.
 * 3. Since the only way to make it this far is for `a` or `b` to be an object, if
 *    `a` or `b` is *not* an object, they're clearly not the same.
 * 4. It's much faster to compare dates by numeric value than by lexical value.
 * 5. Same goes for Regexps.
 * 6. The parts of an arguments list most people care about are the arguments
 *    themselves, not the callee, which you shouldn't be looking at anyway.
 * 7. Objects are more complex:
 *    a. Return `true` if `a` and `b` both have no properties.
 *    b. Ensure that `a` and `b` have the same number of own properties with the
 *       same names (which is what `Object.keys()` returns).
 *    c. Ensure that cyclical references don't blow up the stack.
 *    d. Ensure that all the key names match (faster).
 *    e. Ensure that all of the associated values match, recursively (slower).
 */
function shallower_ (a, b, ca, cb) {
  if (typeof a !== 'object' && typeof b !== 'object' && a === b) {
    return true
  } else if (a === null || b === null) {
    return a === b
  } else if (typeof a !== 'object' || typeof b !== 'object') {
    return false
  } else if (Buffer.isBuffer(a) && Buffer.isBuffer(b)) {
    return bufferEquals(a, b)
  } else if (a instanceof Date && b instanceof Date) {
    return a.getTime() === b.getTime()
  } else if (a instanceof RegExp && b instanceof RegExp) {
    return a.source === b.source &&
    a.global === b.global &&
    a.multiline === b.multiline &&
    a.lastIndex === b.lastIndex &&
    a.ignoreCase === b.ignoreCase
  } else if (isArguments(a) || isArguments(b)) {
    var slice = Array.prototype.slice
    return shallower_(slice.call(a), slice.call(b), ca, cb)
  } else {
    if (Array.isArray(a) !== Array.isArray(b)) return false

    var ka = Object.keys(a)
    var kb = Object.keys(b)
    // don't bother with stack acrobatics if there's nothing there
    if (ka.length === 0 && kb.length === 0) return true
    if (ka.length !== kb.length) return false

    var cal = ca.length
    while (cal--) if (ca[cal] === a) return cb[cal] === b
    ca.push(a); cb.push(b)

    ka.sort(); kb.sort()
    for (var k = ka.length - 1; k >= 0; k--) if (ka[k] !== kb[k]) return false

    var key
    for (var l = ka.length - 1; l >= 0; l--) {
      key = ka[l]
      if (!shallower_(a[key], b[key], ca, cb)) return false
    }

    ca.pop(); cb.pop()

    return true
  }
}
