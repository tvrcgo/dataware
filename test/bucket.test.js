
const Dataware = require('../index')
const assert = require('power-assert')

describe('bucket', function() {

  const dw = new Dataware({
    endpoint: 'localhost:27017'
  })
  const bucket = dw.bucket('test/testbucket')
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

  it('query objects', (done) => {
    bucket.query({
      where: {
        title: { $in: ['t1', 't2', 't3'] }
      },
      limit: 3
    }).then(ret => {
      assert(ret.length === 3)
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

  it('patch object', (done) => {
    bucket.body({ title: 'abc', desc: 'def' }).post().then(ret => {
      assert(ret.story.title === 'abc')
      assert(ret.story.desc === 'def')
      const storyId = ret.story._id
      bucket.body({ title: 'def' }).patch(storyId).then(updret => {
        assert(updret.meta.ok === 1)
        assert(updret.meta.nModified === 1)
        assert(updret.meta.n === 1)
        bucket.get(storyId).then(ret3 => {
          assert(ret3.title === 'def')
          assert(ret3.desc === 'def')
          done()
        })
      })
    })
  })

  it('put object', (done) => {
    bucket.body({ title: 'abc', desc: 'def' }).post().then(ret => {
      assert(ret.story.title === 'abc')
      assert(ret.story.desc === 'def')
      const storyId = ret.story._id
      bucket.body({ title: 'def' }).put(storyId).then(updret => {
        assert(updret.meta.ok === 1)
        assert(updret.meta.nModified === 1)
        assert(updret.meta.n === 1)
        bucket.get(storyId).then(ret3 => {
          assert(ret3.title === 'def')
          assert(ret3.desc === undefined)
          done()
        })
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

  it('close dataware', () => {
    dw.close()
  })
})
