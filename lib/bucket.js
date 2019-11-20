const { ObjectID } = require('mongodb')
const Client = require('./client')

const _query = (terms) => {
  if (terms instanceof ObjectID || typeof terms === 'string') {
    return {
      _id: terms
    }
  }
  return Object.assign({}, terms)
}

class Bucket {
  constructor(params) {
    this.$client = new Client(params)
  }

  object(name) {
    const [dbName, coName] = name.split('/')
    Object.assign(this.$client.$params, {
      database: dbName,
      collection: coName
    })
    return this
  }

  body(object = {}) {
    this.$body = object
    return this
  }

  get(objectId = '') {
    return this.$client
      .query({
        where: {
          _id: objectId
        }
      })
      .then(rows => ({ data: rows[0]||{} }))
  }

  query(terms = {}) {
    return this.$client
      .query(terms)
  }

  post(objectId = '') {
    const isBatch = (toString.call(this.$body) === '[object Array]')
    if (objectId && this.$body && !isBatch) {
      this.$body._id = objectId
    }
    return this.$client
      .post({
        body: this.$body
      })
      .then(ret => ({
        data: isBatch ? ret.ops : (ret.ops[0]||{}),
        meta: ret.result
      }))
  }

  patch(terms = '') {
    return this.$client
      .update({
        body: this.$body,
        where: _query(terms)
      })
      .then(ret => ({ meta: ret }))
  }

  put(terms = '') {
    return this.$client
      .update({
        body: this.$body,
        where: _query(terms),
        replace: true
      })
      .then(ret => ({ meta: ret }))
  }

  remove(terms = '') {
    return this.$client
      .remove({
        where: _query(terms)
      })
      .then(ret => ({ meta: ret }))
  }

  drop() {
    return this.$client.drop()
  }
}

module.exports = Bucket
