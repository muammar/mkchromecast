
0.5.0 / 2014-04-04 
==================

  * Merge pull request #13 from patrick-steele-idem/master
  * Store the stats with each bench to help reporters report the results
  * Added Patrick Steele-Idem as contributor
  * Simplified the reporter API and added support for third-party reporters

0.4.1 / 2013-12-02 
==================

 * Merge branch 'refactor/v8'
 * bin: v8-argv support
 * test: confirm can run single iteration. Closes #11
 * docs: before/after were undocumented. Closes #7
 * Merge pull request #10 from alexlande/patch-1
 * Replace simplistic with simple in readme

0.4.0 / 2013-10-15 
==================

 * Merge pull request #8 from visionmedia/add/harmony
 * add support for some v8 flags including --harmony

0.3.0 / 2013-08-12 
==================

 * reporter: [csv ] small tweaks
 * reporter: [plain] small tweaks
 * deps: [electron] update version tag
 * example: [async] errors on node 10
 * Merge pull request #5 from vavere/master
 * update readme
 * add help about available interfaces/reporters
 *  add csv reporter
 * add plain text reporter
 * Merge pull request #4 from domenic/patch-1
 * Small fixes to make more pleasant on Windows
 * bin checks for existence of default `benchmark` folder if no files provided
 * code cleanup for runner and comments
 * comments for suite

0.2.0 / 2012-07-24 
==================

  * add async bench example + cleanup
  * fix bug for async bench improper sequence of events
  * improvide code consistency for interface
  * further cleaning of utils
  * remove unused utils
  * comment updates for timer
  * provide date based timer for node < 0.8.x
  * remove progress event listeners from reporters
  * suite code cleanup
  * bench code cleanup
  * refactor series helper and update runner to comply
  * Merge branch 'refactor/bench-timers'
  * bench is using timer, not Date
  * Merge branch 'refactor/reporter'
  * comment cleanup
  * finish modulizing reporter system to open up for more!
  * Merge branch 'master' into refactor/reporter
  * Merge branch 'feature/timers'
  * add node high res timer constructor
  * begin reporter refactor - folder organization
  * Merge branch 'refactor/interface'
  * add export interface style and a bit more commenting to existing
  * refactor interfaces to use an interface manager
  * Merge pull request #2 from domenic/patch-1
  * Add xsuite and xbench for temporarily disabling benchmarks.
  * Merge branch 'feature/cli'
  * refactor cli to use electron
  * more sample benchmarks
  * main cli router
  * match update
  * bench onprogess looks for options in the right place

0.1.1 / 2012-01-29 
==================

  * update screenshot
  * bench refactored to be a lot more efficient (and less taxing on stats), especially when running adaptively
  * clean up existence example
  * fonder naming complete
  * standard deviation util
  * folder rearrange
  * bench holds own options + code cleanup
  * i'll have typos for 1000, thanks
  * README typos

0.1.0 / 2012-01-29 
==================

  * README
  * sane defaults
  * few small cli things
  * default reporter finished
  * make reports presentable
  * foot suite completed event and reporting
  * correct folder `benchmark` not `benchmarks`
  * reporting tweaks
  * before / after support in suite/bench/runner
  * before and after in sample benchmarks
  * adding some variation to the included benchmarks
  * bench detects runnable fn is async by using function length
  * clean reporter
  * bench return more stats
  * bench list (results) event for runner
  * nested suite example
  * added clean reporter, main exports, clean up
  * broke up suite to allow for nesting … added runner
  * scrap crappy reporter
  * update interface to match intended style
  * teach bench how to count
  * added some utils
  * using optimist in binfile
  * update benchmarks to match intended style
  * git ignore vim stuffs
  * package updates

0.0.2 / 2011-12-06 
==================

  * bin does `mocha` style global pre-requires
  * static report includes memory
  * cli reports in ms
  * suite run provide callback
  * better sample benchmarks
  * bench events use spaces, not cameCase
  * sample test defaults
  * do series cleanup
  * sample benchmarks (temporary)
  * added bin file
  * name change
  * rename to matcha
  * damn exports

0.0.1 / 2011-12-05 
==================

  * package.json updates
  * first working version
  * project init
