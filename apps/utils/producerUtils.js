var exports = module.exports = {}

const csv = require('fast-csv')
const fs = require('fs')

exports.getProductsFromCSV = async (fileLocation) => {
  let resolveCallback
  const promise = new Promise((resolve, reject) => {
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

const toMoltinObject = data => ({
  // left is moltin || right is CSV
  sku: data.sku,
  name: data.name,
  description: data.description,
})

const addProductToGetQueue = async (jobQueue, product) => {
  console.log('running addProductToGetQueue')

  jobQueue
    .add('get-product', {
      title: `Getting product ${product.sku}`,
      product,
    })

  console.log('done addProductToGetQueue')
}

exports.addProductsToGetQueue = async (jobQueue, products) => {
  for (let i = 0, len = products.length; i < len; i++) {
    const product = products[i]
    await addProductToGetQueue(jobQueue, product)
  }
}
