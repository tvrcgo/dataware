const { Search } = require('../lib/index')
const assert = require('power-assert')

const sleep = (time) => new Promise(resolve => setTimeout(resolve, time))

describe('Search', () => {

  const search = new Search({
    host: 'http://localhost:9200',
    version: 5.6
  })

  const indexName = 'sdktest'
  let docId = ''

  it('create index', async () => {
    const res = await search.index(indexName).create()
    assert(res.index === indexName)
  })

  it('create document', async () => {
    const res = await search.index(indexName).body({
      title: 'new title',
      desc: 'ab'
    }).post()
    assert(res.result === 'created')
    docId = res._id
  })

  it('create document using specified _id', async () => {
    const res = await search.index(indexName).body({
      title: 'new title2',
      desc: 'ab'
    }).post('abcdefg')
    assert(res.result === 'created')
    assert(res._id === 'abcdefg')
  })

  it('update document (patch)', async () => {
    const res = await search.index(indexName).body({
      title: 'title2'
    }).patch(docId)
    assert(res.result === 'updated')
    const doc = await search.index(indexName).get(docId)
    assert(doc.title === 'title2')
  })

  it('update document (replace)', async () => {
    const res = await search.index(indexName).body({
      title: 'xxx'
    }).put(docId)
    assert(res.result === 'updated')
    const doc = await search.index(indexName).get(docId)
    assert(doc.title === 'xxx')
    assert(doc.desc === undefined)
  })

  it('query documents', async () => {
    await sleep(1000)
    const data = await search.index(indexName).query('q=desc:(ab)')
    assert(data.length === 1)
  })

  it('remove document', async () => {
    const res = await search.index(indexName).remove(docId)
    assert(res.result === 'deleted')
  })

  it('remove index', async () => {
    const res = await search.index(indexName).drop()
    assert(res.acknowledged)
  })
})
