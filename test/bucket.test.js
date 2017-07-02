
const Dataware = require('../index')
const assert = require('power-assert')

describe('bucket', function() {

  const dw = new Dataware({
    auth: 'weilai:weilai',
    endpoint: 'tvrcgo.com:27077'
  })
  const bucket = dw.bucket('test/testbucket')
  let tmpId = ''

  it('post object', function* () {
    const ret = yield bucket.body({ title: 'hello' }).post()
    assert(ret.story.title = 'hello')
    tmpId = ret.story._id
  })

  it('batch objects', function* () {
    const ret = yield bucket.body([
      { title: 't1' },
      { title: 't2' },
      { title: 't3' }
    ]).batch()
    assert(ret.stories.length === 3)
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
    const object = yield bucket.get(tmpId)
    assert(object.title === 'hello')
    assert(object._id.toString() === tmpId.toString())
  })

  it('patch object', function* () {
    const ret = yield bucket.body({ title: 'abc', desc: 'def' }).post()
    assert(ret.story.title === 'abc')
    assert(ret.story.desc === 'def')

    const storyId = ret.story._id
    const ret2 = yield bucket.body({ title: 'def' }).patch(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const object = yield bucket.get(storyId)
    assert(object.title === 'def')
    assert(object.desc === 'def')
  })

  it('put object', function* () {
    const ret1 = yield bucket.body({ title: 'abc', desc: 'def' }).post()
    assert(ret1.story.title === 'abc')
    assert(ret1.story.desc === 'def')

    const storyId = ret1.story._id
    const ret2 = yield bucket.body({ title: 'def' }).put(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const object = yield bucket.get(storyId)
    assert(object.title === 'def')
    assert(object.desc === undefined)
  })

  it('remove object', function* () {
    yield bucket.body({ title: 'story title' }).post('test-story')
    const ret = yield bucket.remove('test-story')
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 1)
  })

  it('other bucket', function* () {
    const bkt = dw.bucket('test/testbucket2')
    const obj = yield bkt.body({ title: 'other' }).post()
    assert(obj.story.title === 'other')
    assert(obj.meta.ok === 1)
    assert(obj.meta.n === 1)
  })

  it('drop bucket', function* () {
    const ret = yield bucket.drop()
    assert(ret === true)
  })

})
