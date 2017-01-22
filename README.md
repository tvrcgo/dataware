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
  url: 'mongodb://username:***@host:port'
})
```

### Bucket

```js
const bucket = square.bucket('sample')

bucket.body({ ...body }).post()
bucket.body({ ...body }).update('object-id')
bucket.get('object-id')
bucket.remove('object-id')
```