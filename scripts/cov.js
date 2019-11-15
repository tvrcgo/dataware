
const { resolve } = require('path')
const cp = require('child_process')
const nyc = require.resolve('nyc/bin/nyc.js')
const args = [
  '--temp-directory', './node_modules/.nyc_output',
  '--report-dir', 'cov',
  'node',
  'scripts/test'
]
const opt = {
  env: {
    NODE_ENV: 'test',
    FORCE_COLOR: true
  }
}
cp.fork(nyc, args, opt)

