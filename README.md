# Square

Data square.

### Install

```bash
npm i tvrcgo/square --save
```

## Example

### Square

```js
import Square from 'square'

const square = new Square({
  auth: 'username:password',
  authSource: 'admin',
  endpoint: 'host:27017'
})
```

### Bucket

```js
const bucket = square.bucket('db/collection')

bucket.body(object).post()
bucket.body(object).post('object-id')
bucket.body([ object1, object2, object3 ]).batch()
bucket.body(patchBody).update('object-id')
bucket.get('object-id')
bucket.remove('object-id')
```