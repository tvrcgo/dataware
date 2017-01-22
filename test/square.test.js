
const Square = require('../index')
const assert = require('assert')

describe('square', () => {

  const square = new Square({
    url: 'mongodb://localhost:27017/square?authSource=admin'
  })

  describe('#bucket', () => {
    const bucket = square.bucket('testbucket')
    let tmpId = ''

    it('post object', (done) => {
      bucket.body({ title: 'hello' }).post().then(ret => {
        assert(ret.stories.length === 1)
        assert(ret.stories[0].title = 'hello')
        tmpId = ret.stories[0]._id
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
        assert(ret.stories.length === 1)
        assert(ret.stories[0].title === 'abc')
        const storyId = ret.stories[0]._id
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
})
