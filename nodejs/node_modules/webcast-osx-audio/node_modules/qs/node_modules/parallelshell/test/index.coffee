chai = require "chai"
should = chai.should()
spawn = require("child_process").spawn
Promise = require("bluebird")

verbose = 0

# cross platform compatibility
if process.platform == "win32"
  sh = "cmd"
  shArg = "/c"
else
  sh = "sh"
  shArg = "-c"

# children
waitingProcess = "\"node -e 'setTimeout(function(){},10000);'\""
failingProcess = "\"node -e 'throw new Error();'\""

usageInfo = """
-h, --help         output usage information
-v, --verbose      verbose logging
-w, --wait         will not close sibling processes on error
""".split("\n")

cmdWrapper = (cmd) ->
  if process.platform != "win32"
    cmd = "exec "+cmd
  if verbose
    console.log "Calling: "+cmd
  return cmd

spawnParallelshell = (cmd) ->
  return spawn sh, [shArg, cmdWrapper("node ./index.js "+cmd )], {
    cwd: process.cwd
  }

killPs = (ps) ->
  ps.kill "SIGINT"

spyOnPs = (ps, verbosity=1) ->
  if verbose >= verbosity
    ps.stdout.setEncoding("utf8")
    ps.stdout.on "data", (data) ->
      console.log data
    ps.stderr.setEncoding("utf8")
    ps.stderr.on "data", (data) ->
      console.log "err: "+data

testOutput = (cmd, expectedOutput) ->
  return new Promise (resolve) ->
    ps = spawnParallelshell(cmd)
    spyOnPs ps, 3
    ps.stdout.setEncoding("utf8")
    output = []
    ps.stdout.on "data", (data) ->
      lines = data.split("\n")
      lines.pop() if lines[lines.length-1] == ""
      output = output.concat(lines)
    ps.stdout.on "end", () ->
      for line,i in expectedOutput
        line.should.equal output[i]
      resolve()

describe "parallelshell", ->
  it "should print on -h and --help", (done) ->
    Promise.all([testOutput("-h", usageInfo), testOutput("--help", usageInfo)])
    .then -> done()
    .catch done

  it "should close with exitCode 1 on child error", (done) ->
    ps = spawnParallelshell(failingProcess)
    spyOnPs ps, 2
    ps.on "close", () ->
      ps.exitCode.should.equal 1
      done()

  it "should run with a normal child", (done) ->
    ps = spawnParallelshell(waitingProcess)
    spyOnPs ps, 1
    ps.on "close", () ->
      ps.signalCode.should.equal "SIGINT"
      done()

    setTimeout (() ->
      should.not.exist(ps.signalCode)
      killPs(ps)
    ),50


  it "should close sibling processes on child error", (done) ->
    ps = spawnParallelshell([waitingProcess,failingProcess,waitingProcess].join(" "))
    spyOnPs ps,2
    ps.on "close", () ->
      ps.exitCode.should.equal 1
      done()

  it "should wait for sibling processes on child error when called with -w or --wait", (done) ->
    ps = spawnParallelshell(["-w",waitingProcess,failingProcess,waitingProcess].join(" "))
    ps2 = spawnParallelshell(["--wait",waitingProcess,failingProcess,waitingProcess].join(" "))
    spyOnPs ps,2
    spyOnPs ps2,2
    setTimeout (() ->
      should.not.exist(ps.signalCode)
      should.not.exist(ps2.signalCode)
      killPs(ps)
      killPs(ps2)
    ),50
    Promise.all [new Promise((resolve) -> ps.on("close",resolve)),
      new Promise (resolve) -> ps2.on("close",resolve)]
    .then -> done()
    .catch done
  it "should close on CTRL+C / SIGINT", (done) ->
    ps = spawnParallelshell(["-w",waitingProcess,failingProcess,waitingProcess].join(" "))
    spyOnPs ps,2
    ps.on "close", () ->
      ps.signalCode.should.equal "SIGINT"
      done()
    killPs(ps)
