'use strict'

function getDirectoryComponents (path, sep) {
  var components = path.split(sep)

  // Remove any trailing separators and the base component.
  var last = ''
  while (last === '') {
    last = components.pop()
  }

  return components
}

module.exports = function commonPathPrefix (paths, sep) {
  if (!sep) {
    var m = /(\/|\\)/.exec(paths[0])
    // The first path did not contain any directory components. Bail now.
    if (!m) return ''
    sep = m[0]
  }

  // Object to hold prefix strings formed of the directory components of each
  // path. The value for each prefix string is the number of times that prefix
  // occurred in the `paths` array.
  var prefixes = Object.create(null)
  for (var i = 0; i < paths.length; i++) {
    var dirComponents = getDirectoryComponents(paths[i], sep)
    var prefix = ''
    for (var j = 0; j < dirComponents.length; j++) {
      prefix += dirComponents[j] + sep
      prefixes[prefix] = (prefixes[prefix] || 0) + 1
    }
  }

  // Find the prefixes that occurred for each path and sort them by length
  // (longest first).
  var common = Object.keys(prefixes).filter(function (prefix) {
    return prefixes[prefix] === paths.length
  }).sort(function (a, b) {
    return b.length - a.length
  })

  // Return the longest common path prefix, or the empty string.
  return common[0] || ''
}
