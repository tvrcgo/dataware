# API

## Bucket

```js
import { Bucket } from 'dataware'

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

// query use(s)
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

// update use(s) by query
bucket.use('collection').body(patchBody).patch({ type: { $eq: 1 } })
bucket.use('collection').body(newBody).put({ name: { $eq: 'aaa' }})
```

Delete
```js
// remove object by id
bucket.use('collection').remove('object-id')

// remove use(s) by query
bucket.use('collection').remove({ number: { $gt: 5 }})

// drop bucket
bucket.use('collection').drop()
```
