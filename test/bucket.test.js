
const Square = require('../index')
const assert = require('power-assert')

describe('bucket', () => {

  const square = new Square({
    auth: 'username:password',
    authSource: 'admin',
    endpoint: 'example.com:27017'
  })
  const bucket = square.bucket('test/testbucket')
  let tmpId = ''

  it('post object', (done) => {
    bucket.body({ title: 'hello' }).post().then(ret => {
      assert(ret.story.title = 'hello')
      tmpId = ret.story._id
      done()
    })
  })

  it('batch objects', (done) => {
    bucket.body([
      { title: 't1' },
      { title: 't2' },
      { title: 't3' }
    ]).batch().then(ret => {
      assert(ret.stories.length === 3)
      assert(ret.meta.ok === 1)
      assert(ret.meta.n === 3)
      done()
    })
  })

  it('get object', (done) => {
    bucket.get(tmpId).then(ret => {
      assert(ret.title === 'hello')
      assert(ret._id.toString() === tmpId.toString())
      done()
    })
  })

  it('update object', (done) => {
    bucket.body({ title: 'abc' }).post().then(ret => {
      assert(ret.story.title === 'abc')
      const storyId = ret.story._id
      bucket.body({ title: 'def' }).update(storyId).then(updret => {
        assert(updret.meta.ok === 1)
        assert(updret.meta.nModified === 1)
        assert(updret.meta.n === 1)
        done()
      })
    })
  })

  it('remove object', (done) => {
    bucket.body({ title: 'story title' }).post('test-story').then(ret => {
      bucket.remove('test-story').then(rmret => {
        assert(rmret.meta.ok === 1)
        assert(rmret.meta.n === 1)
        done()
      })
    })
  })
})
