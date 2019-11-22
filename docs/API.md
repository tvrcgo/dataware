# API

## Bucket

```js
const { Bucket } = require('dataware')

const bucket = new Bucket({
  auth: 'username:password',
  authSource: 'admin',
  endpoint: 'localhost:27017',
  database: 'db'
})
```

Create
```js
// post object
bucket.use('collection').body(object).post()
bucket.use('collection').body(object).post('object-id')

// post batch objects
bucket.use('collection').body([ object1, object2, object3 ]).post()
```

Read
```js
// get object by id
bucket.use('collection').get('object-id')

// query objects
bucket.use('collection').query({
  where: {
    title: {
      $in: ['t1', 't2', 't3']
    }
  },
  skip: 5,
  limit: 10,
  sort: {
    created_at: -1
  }
})
```

Update
```js
// update object by id
bucket.use('collection').body(patchBody).patch('object-id')
bucket.use('collection').body(newBody).put('object-id')

// update objects by condition
bucket.use('collection').body(patchBody).patch({ type: { $eq: 1 } })
bucket.use('collection').body(newBody).put({ name: { $eq: 'aaa' }})
```

Delete
```js
// remove object by id
bucket.use('collection').remove('object-id')

// remove objects by condition
bucket.use('collection').remove({ number: { $gt: 5 }})

// drop collection
bucket.use('collection').drop()
```


## Search

```js
const { Search } = require('dataware')

const search = new Search({
  host: 'http://localhost:9200',
  version: 5.6
})
```

Create index
```js
const res = await search.index('indexName').init()
```

Create document
```js
const res = await search.index('indexName').body(payload).post()
```

Remove document
```js
const res = await search.index('indexName').remove('doc-id')
```

Update document
```js
// patch
const res = await search.index('indexName').body(patchBody).patch('doc-id')

// replace
const res = await search.index('indexName').body(putBody).put('doc-id')
```

Get document
```js
const res = await search.index('indexName').get('doc-id')
```

Query documents
```js
const res = await search.index('indexName').query('q=title:(abc)')
```

Remove index
```js
const res = await search.index('indexName').drop()
```
