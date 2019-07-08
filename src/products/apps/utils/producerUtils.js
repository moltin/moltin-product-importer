/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

const csv = require('fast-csv')
const fs = require('fs')
const moltin = require('./moltinUtils')

const analyseMoltinFlowData = async (flowData, attributesArray) => {
  const results = []

  const simplifiedFlowData = Object.keys(flowData)
  const simplifiedAttributesArray = attributesArray.map(attribute => (attribute.label))

  simplifiedFlowData.forEach((field) => {
    if (!simplifiedAttributesArray.some(el => el === field)) {
      results.push(field)
    }
  })

  const filteredResults = results.filter(el => el !== '')
  return filteredResults
}

const addProductToGetQueue = async (jobQueue, product) => {
  jobQueue
    .add('get-product', {
      title: `Getting product ${product.sku}`,
      product,
    })
}

const parseCoreData = async (json) => {
  const required = ['name', 'sku', 'description', 'slug', 'price']

  const missingCoreData = required
    .filter(key => !Object.keys(json).includes(key))

  return missingCoreData
}

const parseFlowData = async (json) => {
  const allowed = ['id', 'name', 'sku', 'description', 'manage_stock', 'slug', 'price', 'commodity_type', 'status', 'stock', 'weight']

  const flowData = Object.keys(json)
    .filter(key => !allowed.includes(key))
    .reduce((obj, key) => {
      const newObj = obj
      newObj[key] = json[key]
      return newObj
    }, {})

  return flowData
}

const checkProductAttributes = async () => {
  const attributes = await moltin.getAttributes()
  return attributes.data
}

export async function analyseProductCoreData(payload) {
  const result = await parseCoreData(payload)
  return result
}

export async function analyseProducts(payload) {
  const attributesArray = await checkProductAttributes()
  const flowData = await parseFlowData(payload)
  const analyseMoltinFlowDataResult = await analyseMoltinFlowData(flowData, attributesArray)
  return analyseMoltinFlowDataResult
}

export async function createMissingFlowData(flowID, analyseMoltinFlowDataResult) {
  const newFieldsCreated = []

  console.log('analyseMoltinFlowDataResult', JSON.stringify(analyseMoltinFlowDataResult))

  analyseMoltinFlowDataResult.forEach((field) => {
    if (!newFieldsCreated.some(el => el === field)) {
      try {
        if (field !== '') {
          console.log('creating field', field)
          moltin.createField(flowID, field)
          newFieldsCreated.push(field)
        }
      } catch (e) {
        console.log(e)
      }
    }
  })

  await Promise.all(newFieldsCreated)
}

export async function getProductsFromCSV(fileLocation) {
  return new Promise((resolve, reject) => {
    try {
      const objects = []

      const reader = csv.parse({
        headers: true,
        objectMode: true,
        ignoreEmpty: true,
      })

      const productsStream = fs.createReadStream(fileLocation)
      productsStream.on('error', () => {
        reject(new Error('Cannot find your CSV file'))
      })

      const csvStream = reader
        .on('data', data => objects.push(data))
        .on('end', () => {
          resolve(objects)
        })
      productsStream.pipe(csvStream)
    } catch (e) {
      reject(e)
    }
  })
}

export async function addProductsToGetQueue(jobQueue, products) {
  for (let i = 0, len = products.length; i < len; i += 1) {
    const product = products[i]
    addProductToGetQueue(jobQueue, product)
  }
}
