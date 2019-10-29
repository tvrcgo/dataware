# API

## Dataware

```js
import Dataware from 'dataware'

const dataware = new Dataware({
  auth: 'username:password',
  authSource: 'admin',
  endpoint: 'localhost:27017'
})
```

## Bucket

```js
const bucket = dataware.bucket('db/collection')
```

Create
```js
// post object
bucket.body(object).post()
bucket.body(object).post('object-id')
bucket.body([ object1, object2, object3 ]).post()
```

Read
```js
// get object by id
bucket.get('object-id')
// query object(s)
bucket.query({
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
bucket.body(patchBody).patch('object-id')
bucket.body(newBody).put('object-id')
// update object(s) by query
bucket.body(patchBody).patch({ type: { $eq: 1 } })
bucket.body(newBody).put({ name: { $eq: 'aaa' }})
```

Delete
```js
// remove object by id
bucket.remove('object-id')
// remove object(s) by query
bucket.remove({ number: { $gt: 5 }})
// drop bucket
bucket.drop()
```
