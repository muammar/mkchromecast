/*!
 * Electron - simple theme
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
  spec.command = spec.command || 'default';
  spec.usage = spec.usage || '<options>';

  // colors!
  this.colorize(spec.noColor || false);

  // helper function and variables
  var l = function (s) { console.log(spec.prefix.cyan + '  ' + (s || '')); }
    , pad = function (s, w) { return s + Array(w - s.length - 1).join(' '); }
    , name = this.opts.name
    , base = this.opts.base;

  // header
  l();
  l(name.cyan + ' ' + this.opts.version);
  if (this.opts.desc) l(this.opts.desc.gray);

  // get the command
  var command = this.commands.filter(function (cmd) {
    return (cmd.opts.cmd === spec.command) ? true : false;
  })[0];

  // check for command
  if (!command) {
    l('Invalid command identified for help.'.red);
    l();
    process.exit();
  }

  // comamnd usage
  l();
  l('Usage: '.green + base.gray + ' ' + spec.usage);
  l();
  l('Options:'.magenta);
  l();

  // iterate through options
  command.opts.options.forEach(function (opt) {
    var opts = opt.opts.flags.map(function (flag) {
      if (flag.length === 1) return '-' + flag;
      else return '--' + flag;
    });

    l(pad('', 4)
      + pad(
          opts.join(', ')
          + (opt.opts.def ? ' [' + opt.opts.def + ']' : '' )
        , 26)
      + ' ' + opt.desc.gray);
  });

  // all done
  l();
  l(command.opts.desc.blue);
  l();
  process.exit();
}
