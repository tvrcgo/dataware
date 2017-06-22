const { MongoClient, ObjectID } = require('mongodb')
const { EasyBucket } = require('./bucket')

class Square {

  constructor(props) {
    this.$props = props
    this.$db = new Map()
    this.$bucket = new Map()
  }

  connect(dbName) {
    const { endpoint, auth, authSource = 'test' } = this.$props
    let url = `mongodb://${auth ? auth+'@' : ''}${endpoint}/:db?authSource=${authSource}`
    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      if (this.$db.get(dbName)) {
        return resolve(this.$db.get(dbName))
      }
      url = url.replace(':db', `${dbName}`)
      MongoClient.connect(url, (err, db) => {
        if (err || !db) {
          return reject(err)
        }
        this.$db.set(dbName, db)
        resolve(this.$db.get(dbName))
      })
    }).catch(err => {
      console.error(err.message)
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