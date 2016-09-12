
1.1.0 / 2012-12-22 
==================

  * listeners: [tests] add tests for #listeners
  * listeners: [enhanced/emitter] add feature, return array of listeners for event

1.0.0 / 2012-11-15 
==================

  * readme
  * add new benchmarks
  * remove old benchmakrs
  * remove codex docs
  * Merge branch 'refactor/1xx'
  * enhanced: tests for (un)bind/(un)proxy
  * improve argument parsing or (un)proxyEvent when used with enhanced
  * emitter: tests for (un)bind/(un)proxy
  * common: (un)proxyEvent doesn't error if no drip settings storage
  * tests: enhanced emit
  * travis node 0.8
  * refactor most of the tests
  * typos in the lib
  * remove old tests
  * refactor lib to be seperate constructors
  * refactor makefile
  * refactor makefile
  * update ignore files
  * component: json not js
  * add component.json
  * refactor package.json and move matcha to global install
  * change docs generation behavion
  * remove browser build tools
  * rename benchmark folder
  * using chai-spies
  * broken travis

0.3.1 / 2012-06-12 
==================

  * browser build
  * docs tweaks
  * Merge branch 'feature/docs'
  * docs get a new coat of paint

0.3.0 / 2012-06-10 
==================

  * Merge branch 'refactor/toggle'
  * browser build
  * update tests to conform to switched bind/proxy
  * reverse functionality for bind / proxy to make more sense. comments to lib/proxy like a boss
  * refactor traverse for #emit/#has as high level private function
  * refactor all benchmarks for matcha 1.0
  * browser build for testing
  * off toggle support on wildcard
  * pivot attached functions based on type for #emit and #on
  * update matcha
  * fix bug where array based event lookup was modifying original array.
  * Merge branch 'feature/proxyevents'
  * test tweak for has to support detection of wildcard `on` calls with specific `has` calls
  * browser build
  * all tests for proxy/bind
  * eventProxy memorizes proxy function for proper unbinding
  * tests for proxy and bind
  * refactoring eventProxy and bind
  * benchmark cleanup
  * tests for #has
  * feature #has complete
  * refactor emit as all callbacks are stored in array
  * clean up benchmarks
  * refactor build steps
  * clean deps
  * test coverage support
  * move prefix/suffix to support where it belongs
  * test cleanup
  * code cleanup

0.2.4 / 2012-03-07 
==================

  * all function return this for chaining

0.2.3 / 2012-01-27 
==================

  * Merge branch 'feature/proxyListener'
  * tests detect browser or node run
  * browser tests updated
  * package.json typo
  * wildcard only tests
  * proxy event tests
  * browser update
  * added #proxyEvent
  * updated compile to support folio updates
  * deps updates / removed < node v0.7.0 from engines
  * package updates
  * [docs] small changes to template + output
  * docs uses cleaner template
  * npm ignores docs folder
  * added addition tags to comments for codex doc generation
  * [docs] added analytics
  * docs are correctly linked together
  * codex 0.0.4 support

0.2.2 / 2011-12-07
==================

  * added documentation site
  * documentation
  * makefile makes docs

0.2.1 / 2011-12-07
==================

  * readme/description update
  * added browser compile to makefile
  * 0.2.0 browser dist
  * browser compile function
  * browser prefix/suffix/copyright
  * matcha browser test page
  * build tool: package.json
  * tests browser compatible
  * added travis build status to readme
  * added travis-ci config
  * removing should.js, using `chai`

0.2.0 / 2011-12-06
==================

  * Merge branch 'feature/performance'
  * #emit re-factor complete for wildcarded
  * #off re-factor complete for wildcarded
  * on re-factor complete for wildcarded
  * can pass array to #on to avoid knowing the delimeter
  * options is `wildcard`, not `wildcards
  * wildcard benchmarks
  * wildcard tests
  * better organizing for simple tests
  * #emit re-factored for performance in no wc scenarios
  * new function #removeAllListeners for compat with nodejs events api
  * #off re-factored for performance in no wc scenarios
  * #on re-factored for performance for no wc scenarios
  * constructor function performance refactor
  * tests for non-wildcard events done in mocha
  * benchmarks for non-wildcard scenarios
  * makefile supports test and benchmark
  * changing _callbacks to _events
  * no heat up test required
  * compatible with match 0.2.0
  * separate wildcard usage from not, +tests (incomplete)
  * more benchmarks
  * adding benchmarks

0.1.3 / 2011-10-26
==================

  * bad length check for callbacks in traverse
  * code condensing

0.1.2 / 2011-10-22
==================

  * drip#off cleans nested wildcards

0.1.1 / 2011-10-21
==================

  * options to be stored in this._drip
  * inline comment cleanup

0.1.0 / 2011-10-21
==================

  * Merge branch 'feature/namespaces'
  * removed logging
  * Improved on traversing for nested binds
  * Namespaced events… '*:event' & 'event:*' acceptable.
  * more test scenarios for namespaces
  * Drip#on wildcard namespace

0.0.6 / 2011-10-19
==================

  * Merge branch 'feature/new-tests'
  * tests rewritten with sherlock
  * sherlock for testing

0.0.5 / 2011-10-05
==================

  * wildcard events, cleaner docs

0.0.4 / 2011-10-04
==================

  * package has homepage
  * comment updates for docs

0.0.3 / 2011-10-04
==================

  * all doc updates, ready for gh-pages
  * Comments for main module
  * added version
  * this._callbacks created in constructor

0.0.2 / 2011-10-03
==================

  * once and many
  * off uses splice

0.0.1 / 2011-10-03
==================

  * init package.json
  * Release 0.0.1
  * initialized repo

