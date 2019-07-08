require('dotenv').config()

const { MoltinClient } = require('@moltin/request')

const client = new MoltinClient({
  client_id: process.env.clientId,
  client_secret: process.env.clientSecret,
})

const MoltinGateway = require('@moltin/sdk').gateway

const Moltin = new MoltinGateway({
  client_id: process.env.clientId,
  client_secret: process.env.clientSecret,
})

export async function formatProductForUpdate(id, product) {
  const newProduct = Object.assign({}, product)

  newProduct.type = 'product'
  newProduct.id = id

  return newProduct
}

export async function findProductId(product) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await client.get(`products?filter=eq(sku,${product.sku})`)
      const { data } = result

      if (data.length === 1) {
        resolve(data[0].id)
      }
      reject(new Error('no product found'))
    } catch (e) {
      reject(e)
    }
  })
}

export async function formatProductForInsert(product) {
  const newProduct = Object.assign({}, product)

  newProduct.price = [
    {
      amount: parseInt(product.price, 10) * 100,
      currency: 'USD',
      includes_tax: false,
    },
  ]

  newProduct.status = 'live'
  newProduct.commodity_type = 'physical'
  newProduct.type = 'product'
  newProduct.manage_stock = false

  return newProduct
}

export async function updateProduct(product) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Moltin.Products.Update(product.id, product)
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

export async function insertProduct(product) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Moltin.Products.Create(product)
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

export async function getProduct(product) {
  const {data} = await Moltin.Products.Filter({ eq: { sku: product } })
    .All()
  return data
}

export async function createProductsFlow() {
  return new Promise(async (resolve, reject) => {
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
}

export async function findMoltinProductFlow() {
  return new Promise(async (resolve, reject) => {
    try {
      const flows = await client.get('flows')

      const productsFlow = flows.data.find(flow => flow.slug === 'products')

      resolve(productsFlow)
    } catch (e) {
      reject(e)
    }
  })
}

export async function update(id, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      await client.put(`products/${id}`, payload)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}

export async function getAttributes() {
  return new Promise(async (resolve, reject) => {
    try {
      const attributes = await client.get('products/attributes')
      resolve(attributes)
    } catch (e) {
      reject(e)
    }
  })
}

export async function createField(flowID, fieldName) {
  return new Promise(async (resolve, reject) => {
    try {
      const payload = {
        type: 'field',
        field_type: 'string',
        slug: fieldName.replace(/[^A-Z0-9]/gi, '_'),
        name: fieldName,
        description: fieldName,
        required: false,
        omit_null: true,
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
}
