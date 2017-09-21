
const Dataware = require('../index')
const assert = require('power-assert')

describe('bucket', function() {

  const dw = new Dataware({
    endpoint: 'localhost:27017'
  })
  const bucket = dw.bucket('test/testbucket')
  let tmpId = ''

  it('post object', function* () {
    const ret = yield bucket.body({ title: 'hello' }).post()
    assert(ret.data.title = 'hello')
    tmpId = ret.data._id
  })

  it('batch objects', function* () {
    const ret = yield bucket.body([
      { title: 't1' },
      { title: 't2' },
      { title: 't3' }
    ]).batch()
    assert(ret.data.length === 3)
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 3)
  })

  it('query objects', function* () {
    const ret = yield bucket.query({
      where: {
        title: { $in: ['t1', 't2', 't3'] }
      },
      limit: 3
    })
    assert(ret.length === 3)
  })

  it('get object', function* () {
    const ret = yield bucket.get(tmpId)
    assert(ret.data.title === 'hello')
    assert(ret.data._id.toString() === tmpId.toString())
  })

  it('patch object by id', function* () {
    const ret = yield bucket.body({ title: 'abc', desc: 'def' }).post()
    assert(ret.data.title === 'abc')
    assert(ret.data.desc === 'def')

    const storyId = ret.data._id
    const ret2 = yield bucket.body({ title: 'def' }).patch(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const ret3 = yield bucket.get(storyId)
    assert(ret3.data.title === 'def')
    assert(ret3.data.desc === 'def')
  })

  it('patch object by query', function* () {
    const ret1 = yield bucket.body({ title: 'a', type: 1 }).post()
    const ret2 = yield bucket.body({ title: 'b', type: 1 }).post()
    assert(ret1.data.title === 'a')
    assert(ret2.data.title === 'b')
    const ret3 = yield bucket.body({ title: 'c' }).patch({
      type: {
        $eq: 1
      }
    })
    assert(ret3.meta.ok === 1)
    assert(ret3.meta.nModified === 2)
  })

  it('put object by id', function* () {
    const ret1 = yield bucket.body({ title: 'abc', desc: 'def' }).post()
    assert(ret1.data.title === 'abc')
    assert(ret1.data.desc === 'def')

    const storyId = ret1.data._id
    const ret2 = yield bucket.body({ title: 'def' }).put(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const ret3 = yield bucket.get(storyId)
    assert(ret3.data.title === 'def')
    assert(ret3.data.desc === undefined)
  })

  it('put object by query', function* (){
    const ret = yield bucket.body({ title: 'abc', type: 'put' }).post()
    assert(ret.data.title === 'abc')

    const ret2 = yield bucket.body({ title: 'abcd', type: 'putquery' }).put({
      type: {
        $eq: 'put'
      }
    })
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)

    const ret3 = yield bucket.get(ret.data._id)
    assert(ret3.data.title === 'abcd')
    assert(ret3.data.type === 'putquery')
  })

  it('remove object by id', function* () {
    yield bucket.body({ title: 'story title' }).post('test-story')
    const ret = yield bucket.remove('test-story')
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 1)
  })

  it('remove object by query', function* (){
    yield bucket.body([{ title: 'a' }, { title: 'a' }]).batch()
    const ret = yield bucket.remove({
      title: {
        $eq: 'a'
      }
    })
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 2)
  })

  it('other bucket', function* () {
    const bkt = dw.bucket('test/testbucket2')
    const obj = yield bkt.body({ title: 'other' }).post()
    assert(obj.data.title === 'other')
    assert(obj.meta.ok === 1)
    assert(obj.meta.n === 1)
  })

  it('drop bucket', function* () {
    const ret = yield bucket.drop()
    assert(ret === true)
  })

})
