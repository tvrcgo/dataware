const { MongoClient, ObjectID } = require('mongodb')
const { EasyBucket } = require('./bucket')

class Square {

  constructor(props) {
    this.$props = props
    this.$bucket = new Map()
  }

  connect() {
    const { endpoint } = this.$props
    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      if (this.$db) {
        return resolve(this.$db)
      }
      MongoClient.connect(endpoint, (err, db) => {
        if (err || !db) {
          return reject(err)
        }
        this.$db = db
        resolve(this.$db)
      })
    }).catch((err) => {
      reject(err)
    })
  }

  close() {
    if (this.$db) {
      this.$db.close()
      this.$db = null
    }
  }

  bucket(name) {
    if (!this.$bucket.get(name)) {
      this.$bucket.set(name, new EasyBucket(this.connect.bind(this), name))
    }
    return this.$bucket.get(name)
  }

}

module.exports = Square