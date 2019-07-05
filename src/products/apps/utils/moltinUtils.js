var exports = module.exports = {}

const { MoltinClient } = require('@moltin/request')

const client = new MoltinClient({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET,
})

exports.createProductsFlow = async () => new Promise(async (resolve, reject) => {
  try {
    const payload = {
      type: 'flow',
      name: 'products',
      slug: 'products',
      enabled: true,
      description: 'products',
    }

    const flow = await client.post('flows', payload)
    resolve(flow)
  } catch (e) {
    reject(e)
  }
})

exports.findMoltinProductFlow = async () => new Promise(async (resolve, reject) => {
  try {
    const flows = await client.get('flows')

    const flow = flows.data.find(flow => flow.slug === 'products')

    resolve(flow)
  } catch (e) {
    reject(e)
  }
})

exports.update = async (id, payload) => new Promise(async (resolve, reject) => {
  try {
    await client.put(`products/${id}`, payload)
    resolve()
  } catch (e) {
    reject(e)
  }
})

exports.getAttributes = async () => new Promise(async (resolve, reject) => {
  try {
    const attributes = await client.get('products/attributes')
    resolve(attributes)
  } catch (e) {
    reject(e)
  }
})

exports.createField = async (flowID, fieldName) => new Promise(async (resolve, reject) => {
  try {
    const payload = {
      type: 'field',
      field_type: 'string',
      slug: fieldName.replace(/[^A-Z0-9]/gi, '_'),
      name: fieldName,
      description: fieldName,
      required: false,
      omit_null: false,
      unique: false,
      relationships: {
        flow: {
          data: {
            type: 'flow',
            id: flowID,
          },
        },
      },
    }
    await client.post('fields', payload)
    resolve()
  } catch (e) {
    reject(e)
  }
})
