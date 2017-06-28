# DataWare

### Install

```bash
npm i dataware --save
```

## Example

### Dataware

```js
import Dataware from 'dataware'

const dataware = new Dataware({
  auth: 'username:password',
  authSource: 'admin',
  endpoint: 'localhost:27017'
})
```

### Bucket

#### Basic

```js
const bucket = dataware.bucket('db/collection')

bucket.body(object).post()
bucket.body(object).post('object-id')
bucket.body([ object1, object2, object3 ]).batch()
bucket.body(patchBody).update('object-id')
bucket.get('object-id')
bucket.remove('object-id')
```

#### Query

```js
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