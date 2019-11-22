
const axios = require('axios')

class IndexService {
  constructor(index, options) {
    const { host, username, password, version } = options
    this.$_type = version < 6 ? 'doc' : '_doc'
    this.$client = axios.create({
      baseURL: `${host}/${index}`,
      auth: {
        username,
        password
      }
    })
  }

  async init() {
    try {
      const res = await this.$client.put()
      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  async drop() {
    try {
      const res = await this.$client.delete()
      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  body(payload) {
    this.$payload = payload || {}
    return this
  }

  async post() {
    const res = await this.$client.post(`/${this.$_type}/`, this.$payload)
    return res.data
  }

  async remove(id) {
    try {
      const res = await this.$client.delete(`/${this.$_type}/${id}`)
      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  async patch(id) {
    const res = await this.$client.post(`/${this.$_type}/${id}/_update`, {
      doc: this.$payload
    })
    return res.data
  }

  async put(id) {
    try {
      const res = await this.$client.put(`/${this.$_type}/${id}`, this.$payload)
      return res.data
    } catch (error) {
      return error.response.data
    }
  }

  async get(id) {
    try {
      const res = await this.$client.get(`/${this.$_type}/${id}`)
      const hit = res.data
      const doc = {
        ...hit._source,
        _index: hit._index,
        _type: hit._type,
        _id: hit._type
      }
      return doc
    } catch (error) {
      return error.response.data
    }
  }

  async query(q) {
    const res = await this.$client.get(encodeURI(`/_search?${q}`))
    const rows = res.data.hits.hits.map(h => ({
      ...h._source,
      _index: h._index,
      _type: h._type,
      _id: h._id,
    }))
    return rows
  }
}

module.exports = IndexService
