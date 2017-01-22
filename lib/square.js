const { MongoClient, ObjectID } = require('mongodb')
const { EasyBucket } = require('./bucket')

class Square {

  constructor(props) {
    this.$props = props
    this.$bucket = {}
  }

  connect() {
    const { url } = this.$props
    return new Promise((resolve, reject) => {
      if (!url) {
        return reject(new Error('Missing connect url.'))
      }
      if (this.$db) {
        return resolve(this.$db)
      }
      MongoClient.connect(url, (err, db) => {
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
    if (!this.$bucket[name]) {
      this.$bucket[name] = new EasyBucket(this.connect.bind(this), name)
    }
    return this.$bucket[name]
  }

}

module.exports = Square