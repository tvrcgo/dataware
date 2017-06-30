const { MongoClient, ObjectID } = require('mongodb')

const preproc = (where) => {
  if (where._id && typeof where._id === 'string' && where._id.split('').length === 24) {
    where._id = ObjectID(where._id)
  }
  return where
}

class Bucket {

  constructor(conn, name) {
    this.$conn = conn
    this.$name = name
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.$conn) {
        if (this.$bucket) {
          return resolve(this.$bucket)
        }
        const [dbName, coName] = this.$name.split('/')
        if (!dbName || !coName) {
          return reject('Incorrect bucket name.')
        }
        this.$conn(dbName).then(db => {
          this.$bucket = db.collection(coName)
          resolve(this.$bucket)
        }).catch(reject)
      } else {
        reject(new Error('No connection.'))
      }
    })
  }

  query({ where = {}, sort = {}, skip = 0, limit = 20 }) {
    where = preproc(where)
    return new Promise((resolve, reject) => {
      this.connect().then((bucket) => {
        bucket.find(where, {}).sort(sort).skip(skip).limit(limit).toArray((err, rows) => {
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
    where = preproc(where)
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0) {
        return reject(new Error('Missing update condition.'))
      }
      this.connect().then((bucket) => {
        const opts = { upsert, w: 1 }
        let updBody = { $set: body }
        if (replace) {
          Object.assign(opts, multi)
          updBody = body
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
    where = preproc(where)
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
    if (this.$bucket && this.$bucket.drop) {
      return this.$bucket.drop()
    }
    return false
  }

}

class EasyBucket {
  constructor(conn, name) {
    this.$bucket = new Bucket(conn, name)
  }

  body(object = {}) {
    this.$body = object
    return this
  }

  get(objectId = '') {
    return this.$bucket.query({
      where: {
        _id: objectId
      }
    }).then(rows => rows[0] || null)
  }

  query(terms = {}) {
    return this.$bucket.query(terms)
  }

  post(objectId = '') {
    if (objectId && this.$body) {
      this.$body._id = objectId
    }
    return this.$bucket.post({
      body: this.$body
    }).then(ret => ({
      story: ret.ops[0],
      meta: ret.result
    }))
  }

  batch() {
    if (toString.call(this.$body) !== '[object Array]') {
      return Promise.reject(new Error('Batch body must be array.'))
    }
    return this.$bucket.post({
      body: this.$body
    }).then(ret => ({
      stories: ret.ops,
      meta: ret.result
    }))
  }

  patch(objectId = '') {
    return this.$bucket.update({
      body: this.$body,
      where: {
        _id: objectId
      }
    }).then(ret => ({ meta: ret }))
  }

  put(objectId = '') {
    return this.$bucket.update({
      body: this.$body,
      where: {
        _id: objectId
      },
      replace: true
    }).then(ret => ({ meta: ret }))
  }

  remove(objectId = '') {
    return this.$bucket.remove({
      where: {
        _id: objectId
      }
    }).then(ret => ({ meta: ret }))
  }
}

module.exports = {
  EasyBucket,
  Bucket
}