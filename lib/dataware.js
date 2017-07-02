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
    return new Promise((resolve, reject) => {
      if (!endpoint) {
        return reject(new Error('Missing endpoint.'))
      }
      let url = `mongodb://${auth ? `${auth}@` : ''}${endpoint.replace(/\/$/, '')}/:db`
      if (this.$db.get(dbName)) {
        return resolve(this.$db.get(dbName))
      }
      url = url.replace(':db', `${dbName}`)
      MongoClient.connect(url, {
        db: {
          native_parser: true
        },
        authSource,
        poolSize: 10,
        keepAlive: 2000,
        connectTimeoutMS: 1000,
        autoReconnect: true
      }, (err, db) => {
        if (err || !db) {
          return reject(err)
        }
        this.$db.set(dbName, db)
        resolve(this.$db.get(dbName))
      })
    })
  }

  bucket(name) {
    if (!this.$bucket.get(name)) {
      this.$bucket.set(name, new EasyBucket(this.connect.bind(this), name))
    }
    return this.$bucket.get(name)
  }

  close() {
    this.$db.forEach(db => {
      db.close()
    })
    this.$db.clear()
    this.$bucket.clear()
  }

}

module.exports = DataWare
