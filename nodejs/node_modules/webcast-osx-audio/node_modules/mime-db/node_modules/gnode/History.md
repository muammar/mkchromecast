
0.1.2 / 2016-02-08
==================

  * travis: test lots more node versions
  * README: use SVG for Travis-CI badge
  * test: fix `npm test` failing to run (#21, @etiktin)
  * test: fix typo in test case name

0.1.1 / 2015-01-14
==================

  * package: upgrade regenerator to v0.8.8 (#18, @popomore)
  * travis: use "strings" for version numbers

0.1.0 / 2014-09-12
==================

  * package: update "regenerator" to v0.6.3 (@benjamn, #13)

0.0.8 / 2014-04-28
==================

  * bin: fix repl erroring on valid code (@timoxley, #10)
  * bin: make gnode -p &/or gnode -e work properly (@timoxley, #2, #9)

0.0.7 / 2014-02-14
==================

  * package: allow any v0.x.x of "regenerator"

0.0.6 / 2014-01-06
==================

  * Never compile code that is already valid (#6, @ForbesLindesay)
  * package: update "regenerator" to v0.3.4

0.0.5 / 2013-12-19
==================

  * Upgrade regenerator dependency to v0.3.2 (@benjamn)
  * README++
  * fallback: make `process.argv` only have 1 entry in the repl
  * index: don't add the global require .js hook in some cases
  * index: match the strip shebang logic from `lib/module.js`

0.0.4 / 2013-11-11
==================

  * gnode: fix entering the REPL with other flags are passed in as well
  * gnode: print out the args for debugging purposes with GNODE_PRINT_ARGS
  * gnode: proxy the exit code from the child node process
  * test: initial CLI tests
  * index: strip away the hashbang before feeding the script to esprima

0.0.3 / 2013-10-31
==================

  * gnode: avoid adding the --harmony_generators flag when not supported
  * fallback: set `process.execPath` and `process.argv[0]` to the gnode binary
  * fallback, index: include the regenerator runtime immediately

0.0.2 / 2013-10-30
==================

  * fallback: add proper REPL support
  * fallback: add stdin piping support

0.0.1 / 2013-10-30
==================

  * gitignore: ignore ?.js files
  * gnode: add support for flags on gnode
  * gnode: move the --harmony_generators flag out into a variable
  * gnode: fall back to process.argv[0] for the node process
  * README++
  * add .gitignore
  * fallback: throw an error for REPL / stdin mode for now
  * gnode: only set GNODE_ENTRY_POINT if a 3rd argument was passed in
  * gnode: mark as executable
  * gnode: add comment
  * fallback: clean up the GNODE_ENTRY_POINT env variable
  * gnode: drop the "flag" stuff for now
  * initial commit
