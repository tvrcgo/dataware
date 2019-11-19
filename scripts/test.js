
const { resolve } = require('path')
const { fork } = require('child_process')
const mocha = require.resolve('mocha/bin/_mocha')

const args = [
  '--require',
  'intelli-espower-loader',
  '--exit',
  'test/**/*.test.js'
]

fork(mocha, args, { stdio: 'inherit' })
