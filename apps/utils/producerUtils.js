var exports = module.exports = {}

const csv = require('fast-csv')
const fs = require('fs')

const toMoltinObject = data => ({
  // left is moltin || right is CSV
  sku: data.sku,
  name: data.name,
  description: data.description,
})


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
    .transform(item => toMoltinObject(item))
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
