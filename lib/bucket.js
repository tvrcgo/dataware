const { MongoClient, ObjectID } = require('mongodb')

const conditionFilter = (where) => {
  if (where._id && typeof where._id === 'string' && where._id.split('').length === 24) {
    where._id = ObjectID(where._id)
  }
  return where
}

class Bucket {

  constructor(conn, name) {
    this.$square = conn
    this.$name = name
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.$square) {
        if (this.$bucket) {
          return resolve(this.$bucket)
        }
        this.$square().then(db => {
          this.$bucket = db.collection(this.$name)
          resolve(this.$bucket)
        }).catch(reject)
      } else {
        reject(new Error('No square connection.'))
      }
    })
  }

  query({ where = {} }) {
    where = conditionFilter(where)
    return new Promise((resolve, reject) => {
      this.connect().then((bucket) => {
        bucket.find(where, {}).toArray((err, rows) => {
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

  update({ body = {}, where = {} }) {
    where = conditionFilter(where)
    return new Promise((resolve, reject) => {
      if (Object.keys(where).length === 0) {
        return reject(new Error('Missing update condition.'))
      }
      this.connect().then((bucket) => {
        bucket.update(where, { $set: body }, { multi:true, w: 1 }, (err, ret) => {
          if (err || !ret) {
            return reject(err)
          }
          resolve(ret.result)
        })
      })
    })
  }

  remove({ where = {} }) {
    where = conditionFilter(where)
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

  post(objectId = '') {
    if (objectId && this.$body && toString.call(this.$body) !== '[object array]') {
      this.$body._id = objectId
    }
    return this.$bucket.post({
      body: this.$body
    }).then(ret => ({
      stories: ret.ops,
      meta: ret.result
    }))
  }

  update(objectId = '') {
    return this.$bucket.update({
      body: this.$body,
      where: {
        _id: objectId
      }
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