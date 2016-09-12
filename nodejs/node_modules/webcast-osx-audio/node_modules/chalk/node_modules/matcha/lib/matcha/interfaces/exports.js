/*!
 * Matcha - Exports Interface
 * Copyright(c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * Internal Dependancies
 */

var Suite = require('../suite')
  , Bench = require('../bench');

/*!
 * Primary Export
 */

module.exports = function (interface) {
  var suite = interface.suite
    , suites = [ suite ];

  /*!
   * Listen for require with given spec
   */

  suite.on('require', function (spec) {

    /*!
     * setOptions
     *
     * Set options based on the `options`
     * object for a given suite.
     *
     * @api private
     */

    function setOptions (suite, opts) {
      for (var key in opts) {
        suite.setOption(key, opts[key]);
      }
    }

    /*!
     * setBefore
     *
     * Set before functions based on function
     * or array of functions for a given suite.
     *
     * @api private
     */

    function setBefore (suite, before) {
      if (!Array.isArray(before)) before = [ before ];
      before.forEach(suite.addBefore.bind(suite));
    }

    /*!
     * setAfter
     *
     * Set functions based on function
     * or array of functions for a given suite.
     *
     * @api private
     */

    function setAfter (suite, after) {
      if (!Array.isArray(after)) after = [ after ];
      after.forEach(suite.addAfter.bind(suite));
    }

    /*!
     * setBench
     *
     * Set benches based on benches object
     * of attributed functions for a given suite.
     *
     * @api private
     */

    function setBench (suite, benches) {
      for (var title in benches) {
        suite.addBench(new Bench(title, benches[title]));
      }
    }

    /*!
     * Parse the incoming file
     */

    for (var _suite in spec) {
      var suite = Suite.create(suites[0], _suite)
        , def = spec[_suite];
      if (def.options) setOptions(suite, def.options);
      if (def.before) setBefore(suite, def.before);
      if (def.after) setAfter(suite, def.after);
      if (def.bench) setBench(suite, def.bench);
    }

  });
};
