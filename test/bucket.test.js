
const { Bucket } = require('../lib/index')
const assert = require('power-assert')

describe('bucket', () => {

  const bucket = new Bucket({
    endpoint: 'localhost:27017',
    database: 'test'
  })

  let tmpId = ''

  it('post object', async () => {
    const ret = await bucket.use('testbucket').body({ title: 'hello' }).post()
    assert(ret.data.title === 'hello')
    tmpId = ret.data._id
  })

  it('post batch objects', async () => {
    const ret = await bucket.use('testbucket').body([
      { title: 't1' },
      { title: 't2' },
      { title: 't3' }
    ]).post()
    assert(ret.data.length === 3)
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 3)
  })

  it('query objects', async () => {
    const ret = await bucket.use('testbucket').query({
      where: {
        title: { $in: ['t1', 't2', 't3'] }
      },
      limit: 3
    })
    assert(ret.length === 3)
  })

  it('get object', async () => {
    const ret = await bucket.use('testbucket').get(tmpId)
    assert(ret.data.title === 'hello')
    assert(ret.data._id.toString() === tmpId.toString())
  })

  it('patch object by id', async () => {
    const ret = await bucket.use('testbucket').body({ title: 'abc', desc: 'def' }).post()
    assert(ret.data.title === 'abc')
    assert(ret.data.desc === 'def')

    const storyId = ret.data._id
    const ret2 = await bucket.use('testbucket').body({ title: 'def' }).patch(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const ret3 = await bucket.use('testbucket').get(storyId)
    assert(ret3.data.title === 'def')
    assert(ret3.data.desc === 'def')
  })

  it('patch object by query', async () => {
    const ret1 = await bucket.use('testbucket').body({ title: 'a', type: 1 }).post()
    const ret2 = await bucket.use('testbucket').body({ title: 'b', type: 1 }).post()
    assert(ret1.data.title === 'a')
    assert(ret2.data.title === 'b')
    const ret3 = await bucket.use('testbucket').body({ title: 'c' }).patch({
      type: {
        $eq: 1
      }
    })
    assert(ret3.meta.ok === 1)
    assert(ret3.meta.nModified === 2)
  })

  it('put object by id', async () => {
    const ret1 = await bucket.use('testbucket').body({ title: 'abc', desc: 'def' }).post()
    assert(ret1.data.title === 'abc')
    assert(ret1.data.desc === 'def')

    const storyId = ret1.data._id
    const ret2 = await bucket.use('testbucket').body({ title: 'def' }).put(storyId)
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)
    assert(ret2.meta.n === 1)

    const ret3 = await bucket.use('testbucket').get(storyId)
    assert(ret3.data.title === 'def')
    assert(ret3.data.desc === undefined)
  })

  it('put object by query', async () => {
    const ret = await bucket.use('testbucket').body({ title: 'abc', type: 'put' }).post()
    assert(ret.data.title === 'abc')

    const ret2 = await bucket.use('testbucket').body({ title: 'abcd', type: 'putquery' }).put({
      type: {
        $eq: 'put'
      }
    })
    assert(ret2.meta.ok === 1)
    assert(ret2.meta.nModified === 1)

    const ret3 = await bucket.use('testbucket').get(ret.data._id)
    assert(ret3.data.title === 'abcd')
    assert(ret3.data.type === 'putquery')
  })

  it('remove object by id', async () => {
    await bucket.use('testbucket').body({ title: 'story title' }).post('test-story')
    const ret = await bucket.use('testbucket').remove('test-story')
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 1)
  })

  it('remove object by query', async () => {
    await bucket.use('testbucket').body([{ title: 'a' }, { title: 'a' }]).post()
    const ret = await bucket.use('testbucket').remove({
      title: {
        $eq: 'a'
      }
    })
    assert(ret.meta.ok === 1)
    assert(ret.meta.n === 2)
  })

  it('other collection', async () => {
    const obj = await bucket.use('testbucket2').body({ title: 'other' }).post()
    assert(obj.data.title === 'other')
    assert(obj.meta.ok === 1)
    assert(obj.meta.n === 1)
  })

  it('drop collection', async () => {
    const ret = await bucket.use('testbucket').drop()
    assert(ret === true)
  })

})
