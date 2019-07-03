const exports = module.exports = {}
require('dotenv').config()
const MoltinGateway = require('@moltin/sdk').gateway

const Moltin = new MoltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET,
})

exports.updateProduct = async (product) => {
  console.log(`Updating ID: ${product.id}`)
  return Moltin.Products.Update(product.id, product)
}

exports.insertProduct = async (product) => {
  console.log(`Inserting product: ${product.sku}`)
  return Moltin.Products.Create(product)
}

exports.getProduct = async product => Moltin.Products.Filter({ eq: { sku: product } })
  .All()
  .then(data => data.data)

exports.addProductToInsertQueue = async (jobQueue, product) => {
  jobQueue
    .add('insert-product', {
      title: `Inserting product ${product.sku}`,
      product,
    })
}

exports.addProductToUpdateQueue = async (jobQueue, updatedProduct) => {
  jobQueue
    .add('update-product', {
      title: `Updating product ${updatedProduct.sku}`,
      updatedProduct,
    })
}


exports.handleFailedUpdateJob = (queue, job, errorMessage) => {
  job.moveToFailed('failed', true)
  exports.addProductToUpdateQueue(queue, job.data.product)

  const {
    errors: [{ status }],
  } = errorMessage

  if (status === 429) {
    console.log('Rate limit hit')
    queue.pause.then(() => {
      setTimeout(() => {
        queue.resume()
      }, 2000)
    })
  } else {
    console.log(status)
    job.moveToFailed(status, true)
  }
}

exports.handleFailedInsertJob = (queue, job, errorMessage) => {
  job.moveToFailed('failed', true)
  exports.addProductToInsertQueue(queue, job.data.product)

  const {
    errors: [{ status }],
  } = errorMessage

  if (status === 429) {
    console.log('Rate limit hit')
    queue.pause.then(() => {
      setTimeout(() => {
        queue.resume()
      }, 2000)
    })
  } else {
    job.moveToFailed(status, true)
  }
}
