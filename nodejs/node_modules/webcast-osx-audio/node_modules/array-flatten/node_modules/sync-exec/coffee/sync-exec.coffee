child_process = require 'child_process'
fs = require 'fs'


tmp_dir = '/tmp'
for name in ['TMPDIR', 'TMP', 'TEMP']
  tmp_dir = dir.replace /\/$/, '' if (dir = process.env[name])?


timeout = (limit, msg) ->
  if (new Date).getTime() > limit
    throw new Error msg

create_pipes = ->
  t_limit = (new Date).getTime() + 1000 # 1 second timeout

  until created
    try
      dir = tmp_dir + '/sync-exec-' + Math.floor Math.random() * 1000000000
      fs.mkdir dir
      created = true
    timeout t_limit, 'Can not create sync-exec directory'
  dir


read_pipes = (dir, max_wait) ->
  t_limit = (new Date).getTime() + max_wait

  until read
    try
      read = true if fs.readFileSync(dir + '/done').length
    timeout t_limit, 'Process execution timeout or exit flag read failure'

  until deleted
    try
      fs.unlinkSync dir + '/done'
      deleted = true
    timeout t_limit, 'Can not delete exit code file'

  result = {}
  for pipe in ['stdout', 'stderr', 'status']
    result[pipe] = fs.readFileSync dir + '/' + pipe, encoding: 'utf-8'
    read = true
    fs.unlinkSync dir + '/' + pipe

  try
    fs.rmdirSync dir

  result.status = Number result.status
  result


proxy = (cmd, max_wait, options) ->

  options.timeout = max_wait
  stdout = stderr = ''
  status = 0

  t0 = (new Date).getTime()

  orig_write = process.stderr.write
  process.stderr.write = ->
  try
    stdout = child_process.execSync cmd, options
    process.stderr.write = orig_write
  catch err
    process.stderr.write = orig_write
    if err.signal is 'SIGTERM' and t0 <= (new Date).getTime() - max_wait
      throw new Error 'Timeout'
    {stdout, stderr, status} = err

  {stdout, stderr, status}


module.exports = (cmd, max_wait, options) ->

  if max_wait and typeof max_wait is 'object'
    [options, max_wait] = [max_wait, null]

  options ?= {}

  unless options.hasOwnProperty 'encoding'
    options.encoding = 'utf8'

  unless typeof options is 'object' and options
    throw new Error 'options must be an object'

  max_wait ?= options.timeout or options.max_wait or 3600000 # 1hr default
  unless not max_wait? or max_wait >= 1
    throw new Error '`options.timeout` must be >=1 millisecond'
  delete options.max_wait

  # use native child_process.execSync if available (from node v0.12+)
  if child_process.execSync
    return proxy cmd, max_wait, options

  delete options.timeout

  dir = create_pipes()
  cmd = '((((' + cmd + ' > ' + dir + '/stdout 2> ' + dir + '/stderr ) ' +
        '&& echo 0 > ' + dir + '/status) || echo 1 > ' + dir + '/status) &&' +
        ' echo 1 > ' + dir + '/done) || echo 1 > ' + dir + '/done'
  child_process.exec cmd, options, ->

  read_pipes dir, max_wait
