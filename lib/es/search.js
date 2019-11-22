
const IndexService = require('./index')

module.exports = class Search {
  constructor(options) {
    this._options = options
  }

  index(name) {
    return new IndexService(name, this._options)
  }
}
