exports.add = add
exports.log = log
exports.reset = reset
exports.getPercent = getPercent
exports.store = []
exports.numCompleted = 0

var name_maxlen = 0
  , ops_maxlen = 0
  , ops_arr = []
  , ops_top
  // Using Mocha's coloring
  // https://github.com/visionmedia/mocha/blob/master/lib/reporters/base.js#L100
  , colors = {
      'pass': 90
    , 'fail': 31
    , 'pending': 36
    , 'suite': 0
    , 'fast': 90
    , 'medium': 33
    , 'slow': 31
    , 'green': 32
  }

console.log('')

function add(bench) {
  exports.store.push(bench)

  var len = (bench.name || (Number.isNaN(id) ? id : '<Test #' + id + '>')).length
  name_maxlen = len > name_maxlen ? len : name_maxlen
  var ops = bench.hz.toFixed(bench.hz < 100 ? 2 : 0)
  ops_maxlen = formatNumber(ops).length > ops_maxlen ? formatNumber(ops).length : ops_maxlen
  ops_arr.push(ops)
  ops_top = Math.max.apply(Math, ops_arr);

  process.stdout.write('  '
    + color('pending', (++exports.numCompleted))
    + ' test'
    + (exports.numCompleted > 1 ? 's' : '')
    + ' completed.\u000D')
}

function getPercent(name) {
  var bench;
  for (var i = exports.store.length - 1; i >= 0; i--) {
    var element = exports.store[i]
    if (element.name && element.name == name) {
      bench = element
      break
    }
  }
  return bench ? (bench.hz.toFixed(bench.hz < 100 ? 2 : 0) / ops_top) * 100 : 0
}

function log(options) {
  options = options || {}
  var reset      = options.reset || true
    , tolerances = options.tolerances || { pass: .95, mid: .80 }

  console.log('\n')

  for (var i = 0; i < exports.store.length; i++) {
    logBench(exports.store[i], tolerances)
  }

  if (options.reset === undefined || options.reset === true) exports.reset()

  console.log('')
}

function reset() {
  exports.numCompleted = 0
  exports.store = []
  ops_arr = []
  name_maxlen = 0
  ops_maxlen = 0
}

function logBench(bench, tolerances) {
  var error = bench.error
    , hz = bench.hz
    , id = bench.id
    , stats = bench.stats
    , size = stats.sample.length
    , result = bench.name || (Number.isNaN(id) ? id : '<Test #' + id + '>')
    , name_len = result.length
    , ops = hz.toFixed(hz < 100 ? 2 : 0)
    , deviation = stats.rme.toFixed(2)
    , percent = ops / ops_top

  if (ops == ops_top) result = color('green', result)

  if (error) {
    result += ': ' + color('fail', join(error))
  } else {
    result += makeSpace(name_maxlen - name_len)
      + color('pass', ' x ')
      + makeSpace(ops_maxlen - formatNumber(ops).length)
      + color(
          percent > (tolerances.pass || .95)  ? 'green'
        : percent > (tolerances.mid  || .80)  ? 'medium'
        : 'slow', formatNumber(ops))
      + ' ops/sec '
      + color('pass', '\xb1')
      + color(
          deviation > 5 ? 'slow'
        : deviation > 2 ? 'medium'
        : 'green', deviation)
      + color('pending', '% ')
      + '\u001b[' + colors['pass'] + 'm('
        + size
        + ' run' + (size == 1 ? '' : 's')
        + ' sampled)'
      + '\u001b[0m'
  }
  console.log('  ' + result)
}

function makeSpace(len) {
  var out = ''
  for (var i = len - 1; i >= 0; i--) out += ' '
  return out
}

function color(type, str) {
  return '\u001b[' + colors[type] + 'm' + str + '\u001b[0m'
}

function formatNumber(number) {
  number = String(number).split('.')
  return number[0].replace(/(?=(?:\d{3})+$)(?!\b)/g, ',')
    + (number[1] ? '.' + number[1] : '')
}

function join(object) {
  var result = []
    , length = (object = Object(object)).length
    , arrayLike = length === length >>> 0

  for (key in object) {
    var value = object[key]
    result.push(arrayLike ? value : key + ': ' + value)
  }
  return result.join(',')
}