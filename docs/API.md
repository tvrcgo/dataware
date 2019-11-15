# API

## Bucket

```js
import { Bucket } from 'dataware'

const bucket = new Bucket({
  auth: 'username:password',
  authSource: 'admin',
  endpoint: 'localhost:27017'
})
```

Create
```js
// post object
bucket.object('db/collection').body(object).post()
bucket.object('db/collection').body(object).post('object-id')

// post batch objects
bucket.object('db/collection').body([ object1, object2, object3 ]).post()
```

Read
```js
// get object by id
bucket.object('db/collection').get('object-id')

// query object(s)
bucket.object('db/collection').query({
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
bucket.object('db/collection').body(patchBody).patch('object-id')
bucket.object('db/collection').body(newBody).put('object-id')

// update object(s) by query
bucket.object('db/collection').body(patchBody).patch({ type: { $eq: 1 } })
bucket.object('db/collection').body(newBody).put({ name: { $eq: 'aaa' }})
```

Delete
```js
// remove object by id
bucket.object('db/collection').remove('object-id')

// remove object(s) by query
bucket.object('db/collection').remove({ number: { $gt: 5 }})

// drop bucket
bucket.object('db/collection').drop()
```
