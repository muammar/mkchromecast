/*!
 * Electron - clean theme
 * Copyright (c) 2012 Jake Luer <jake@alogicalparadox.com>
 * MIT Licensed
 */

/*!
 * main export - theme display
 */

module.exports = function cleanHelp (spec) {
  // parse specs
  spec = spec || {};
  spec.prefix = spec.prefix || '';

  // colors
  this.colorize(spec.noColor || false);

  // helper function and variables
  var l = function (s) { console.log(spec.prefix.cyan+ '  ' + (s || '')); }
    , pad = function (s, w) { return Array(w - s.length - 1).join(' ') + s; }
    , name = this.opts.name
    , base = this.opts.base;

  // header
  l();
  l(name.cyan + ' ' + this.opts.version);
  if (this.opts.desc) l(this.opts.desc.gray);

  // commmand display
  this.commands.forEach(function (cmd) {
    // we don't display absent command
    if (cmd.opts.cmd === 'absent') return;

    // hlper variables
    var c = cmd.opts
      , command = c.cmd !== 'default' ? c.cmd + ' ' : ''
      , opts = c.options.length ? '<options>' : '';

    // main lines
    l();
    l(base.gray + ' ' + command.green + opts);
    if (c.desc.length) l(pad('', 4) + c.desc.blue);
    if (!c.options.length) return;

    // if there are options ...
    c.options.forEach(function (opt) {
      var n = c.desc.length ? 6 : 4
        , opts = opt.opts.flags.map(function (flag) {
            if (flag.length === 1) return '-' + flag;
            else return '--' + flag;
          });

      l(pad('', n) + opts.join(', ')
        + (opt.opts.def ? ' [' + opt.opts.def + ']' : '' )
        + ' ' + opt.desc.gray);
    });
  });

  // all done
  l();
  process.exit();
}
