const { MongoClient, ObjectID } = require('mongodb')

const _where = (where) => {
  if (where._id && typeof where._id === 'string' && where._id.split('').length === 24) {
    where._id = ObjectID(where._id)
  }
  return where
}

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
    this.$params = params || {}
    this.$conn = new Map()
  }

  connect() {
    const { endpoint, auth, authSource = 'admin', database, collection } = this.$params

    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      if (!database || !collection) {
        return reject(new Error('Missing database and collection'))
      }
      const connKey = `${database}/${collection}`
      if (this.$conn.get(connKey)) {
        return resolve(this.$conn.get(connKey))
      }
      let url = `mongodb://${auth ? `${auth}@` : ''}${endpoint.replace(/\/$/, '')}/${database}`
      MongoClient.connect(url, {
        authSource,
        poolSize: 10,
        keepAlive: 2000,
        connectTimeoutMS: 1000,
        autoReconnect: true
      }, (err, db) => {
        if (err || !db) {
          return reject(err)
        }
        const coll = db.collection(collection)
        resolve(coll)
        this.$conn.set(connKey, coll)
      })
    })
  }

  query({ where = {}, sort = {}, skip = 0, limit = 20 }) {
    return new Promise((resolve, reject) => {
      this.connect().then((bucket) => {
        bucket.find(_where(where), {}).sort(sort).skip(skip).limit(limit).toArray((err, rows) => {
          if (err || !rows) {
            return reject(err)
          }
          resolve(rows)
        })
      }).catch(reject)
    })
  }

  post({ body = [] }) {
    return new Promise((resolve, reject) => {
      if (body && body.length === 0) {
        return reject(new Error('Post body not found.'))
      }
      this.connect().then((bucket) => {
        bucket.insert([].concat(body), { w:1 }, (err, ret) => {
          if (err || !ret) {
            return reject(err)
          }
          resolve(ret)
        })
      })
    })
  }

  update({ body = {}, where = {}, replace = false, multi = true, upsert = false }) {
    where = _where(where)
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0) {
        return reject(new Error('Missing update condition.'))
      }
      this.connect().then((bucket) => {
        const opts = { upsert, multi, w: 1 }
        let updBody = { $set: body }
        if (replace) {
          updBody = body
          delete opts.multi
        }
        bucket.update(where, updBody, opts, (err, ret) => {
          if (err || !ret) {
            return reject(err)
          }
          resolve(ret.result)
        })
      })
    })
  }

  remove({ where = {} }) {
    where = _where(where)
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0) {
        return reject(new Error('Missing remove condition.'))
      }
      this.connect().then((bucket) => {
        bucket.remove(where, { w:1 }, (err, ret) => {
          if (err || !ret) {
            return reject(err)
          }
          resolve(ret.result)
        })
      })
    })
  }

  drop() {
    return new Promise((resolve, reject) => {
      this.connect().then(bucket => {
        if (bucket && bucket.drop) {
          bucket.drop()
          return resolve(true)
        }
        resolve(false)
      })
    })
  }

}

class EasyBucket {
  constructor(params) {
    this.$bucket = new Bucket(params)
  }

  object(name) {
    const [dbName, coName] = name.split('/')
    Object.assign(this.$bucket.$params, {
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
    return this.$bucket
      .query({
        where: {
          _id: objectId
        }
      })
      .then(rows => ({ data: rows[0]||{} }))
  }

  query(terms = {}) {
    return this.$bucket
      .query(terms)
  }

  post(objectId = '') {
    const isBatch = (toString.call(this.$body) === '[object Array]')
    if (objectId && this.$body && !isBatch) {
      this.$body._id = objectId
    }
    return this.$bucket
      .post({
        body: this.$body
      })
      .then(ret => ({
        data: isBatch ? ret.ops : (ret.ops[0]||{}),
        meta: ret.result
      }))
  }

  patch(terms = '') {
    return this.$bucket
      .update({
        body: this.$body,
        where: _query(terms)
      })
      .then(ret => ({ meta: ret }))
  }

  put(terms = '') {
    return this.$bucket
      .update({
        body: this.$body,
        where: _query(terms),
        replace: true
      })
      .then(ret => ({ meta: ret }))
  }

  remove(terms = '') {
    return this.$bucket
      .remove({
        where: _query(terms)
      })
      .then(ret => ({ meta: ret }))
  }

  drop() {
    return this.$bucket.drop()
  }
}

module.exports = EasyBucket
