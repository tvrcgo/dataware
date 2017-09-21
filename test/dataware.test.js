const Dataware = require('../index')
const assert = require('power-assert')

describe('dataware', function() {

  const dw = new Dataware({
    auth: 'admin:admin',
    endpoint: 'localhost:27017'
  })

  it('error: cannot connect', function* () {
    const dw2 = new Dataware({
      endpoint: 'error-host.com:27017'
    })
    yield dw2.bucket('test/bkt2').get('hello').catch(err => {
      assert(/failed to connect/.test(err.message))
    })
  })

  it('error: no endpoint', function* () {
    const dw2 = new Dataware({})
    yield dw2.bucket('test/testbucket2').get('hello').catch(err => {
      assert(err.message === 'Missing endpoint.')
    })
  })

  it('close dataware', function* () {
    const bucket = dw.bucket('test/testbucket')
    yield bucket.get('test-id')
    assert(dw.$db.size > 0)
    assert(dw.$bucket.size > 0)
    dw.close()
    assert(dw.$db.size === 0)
    assert(dw.$bucket.size === 0)
  })

})
