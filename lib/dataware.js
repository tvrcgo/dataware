const { MongoClient, ObjectID } = require('mongodb')
const { EasyBucket } = require('./bucket')

class DataWare {

  constructor(props) {
    this.$props = props
    this.$db = new Map()
    this.$bucket = new Map()
  }

  connect(dbName) {
    const { endpoint, auth, authSource = 'admin' } = this.$props
    let url = `mongodb://${auth ? `${auth}@` : ''}${endpoint.replace(/\/$/, '')}/:db?authSource=${authSource}`
    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      if (this.$db.get(dbName)) {
        return resolve(this.$db.get(dbName))
      }
      url = url.replace(':db', `${dbName}`)
      MongoClient.connect(url, { native_parser: true }, (err, db) => {
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

  bucket(name) {
    if (!this.$bucket.get(name)) {
      this.$bucket.set(name, new EasyBucket(this.connect.bind(this), name))
    }
    return this.$bucket.get(name)
  }

}

module.exports = DataWare
