
const { MongoClient, ObjectID } = require('mongodb')

const _where = (where) => {
  if (where._id && typeof where._id === 'string' && where._id.split('').length === 24) {
    where._id = ObjectID(where._id)
  }
  return where
}

class Client {

  constructor(params) {
    this.$params = params || {}
    this.$db = new Map()
  }

  connect() {
    const { endpoint, auth, authSource = 'admin', database, collection } = this.$params

    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      if (!database || !collection) {
        return reject(new Error('Missing database or collection.'))
      }
      // connection cache
      const dbconn = this.$db.get(database)
      if (dbconn) {
        return resolve(dbconn.collection(collection))
      }
      // connect
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
        this.$db.set(database, db)
        resolve(db.collection(collection))
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
        bucket.insert([].concat(body), { w: 1 }, (err, ret) => {
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
        bucket.remove(where, { w: 1 }, (err, ret) => {
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
      this.connect().then((bucket) => {
        if (bucket && bucket.drop) {
          bucket.drop()
          return resolve(true)
        }
        resolve(false)
      })
    })
  }

}

module.exports = Client
