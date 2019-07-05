var exports = module.exports = {}
const csv = require('fast-csv')
const fs = require('fs')
const moltin = require('./moltinUtils')

const toMoltinObject = data => ({
  // left is moltin || right is CSV
  sku: data.sku,
  name: data.name,
  description: data.description,
  slug: data.slug,
})

const parseFlowData = async (json) => {
  const allowed = ['id', 'name', 'sku', 'description', 'manage_stock', 'slug']

  const flowData = Object.keys(json)
    .filter(key => !allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = json[key]
      return obj
    }, {})

  return flowData
}

const parseCoreData = async (json) => {
  const allowed = ['id', 'name', 'sku', 'description', 'manage_stock', 'slug', 'status', 'commodity_type', 'price']

  const coreData = Object.keys(json)
    .filter(key => allowed.includes(key))
    .reduce((obj, key) => {
      obj[key] = json[key]
      return obj
    }, {})

  return coreData
}

exports.analyseProducts = async (payload) => {
  const attributesArray = await checkProductAttributes()
  const coreData = await parseCoreData(payload)
  const flowData = await parseFlowData(payload)

  const analyseMoltinFlowDataResult = await analyseMoltinFlowData(flowData, attributesArray)
  return analyseMoltinFlowDataResult
}

exports.createMissingFlowData = async (flowID, analyseMoltinFlowDataResult) => {
  const newFieldsCreated = []

  for (const field of analyseMoltinFlowDataResult) {
    if (!newFieldsCreated.some(el => el === field)) {
      try {
        console.log('creating field', field)
        await moltin.createField(flowID, field)
        newFieldsCreated.push(field)
      } catch (e) {
        console.log(e)
      }
    }
  }
}

const checkProductAttributes = async () => {
  const attributes = await moltin.getAttributes()
  return attributes.data
}

const analyseMoltinFlowData = async (flowData, attributesArray) => {
  const results = []

  const simplifiedFlowData = Object.keys(flowData)
  const simplifiedAttributesArray = attributesArray.map(attribute => (attribute.label))

  for (const field of simplifiedFlowData) {
    if (!simplifiedAttributesArray.some(el => el === field)) {
      results.push(field)
    }
  }
  return results
}

exports.getProductsFromCSV = async (fileLocation) => {
  let resolveCallback
  const promise = new Promise((resolve) => {
    resolveCallback = resolve
  })

  const objects = []

  const reader = csv.parse({
    headers: true,
    objectMode: true,
    ignoreEmpty: true,
  })

  const productsStream = fs.createReadStream(fileLocation)
  const csvStream = reader
    // .transform(item => toMoltinObject(item))
    .on('data', data => objects.push(data))
    .on('end', () => {
      resolveCallback(objects)
    })
  productsStream.pipe(csvStream)

  return promise
}

const addProductToGetQueue = async (jobQueue, product) => {
  jobQueue
    .add('get-product', {
      title: `Getting product ${product.sku}`,
      product,
    })
}

exports.addProductsToGetQueue = async (jobQueue, products) => {
  for (let i = 0, len = products.length; i < len; i += 1) {
    const product = products[i]
    await addProductToGetQueue(jobQueue, product)
  }
}
