var exports = module.exports = {}
require('dotenv').config()
const MoltinGateway = require('@moltin/sdk').gateway

const Moltin = new MoltinGateway({
  client_id: process.env.MOLTIN_CLIENT_ID,
  client_secret: process.env.MOLTIN_CLIENT_SECRET,
})

exports.updateProduct = async (product) => {
  // console.log(`Updating ID: ${product.id}`)
  return await Moltin.Products.Update(product.id, product)
}

exports.insertProduct = async (product) => {
  // console.log(`Inserting product: ${product.sku}`)
  return await Moltin.Products.Create(product)
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

  const { errors } = errorMessage

  if(errors.length === 1) {
    const { status } = errors[0]

    if (status === 429) {
      console.log('Rate limit hit')
      queue.pause.then(() => {
        setTimeout(() => {
          queue.resume()
        }, 2000)
      })
      exports.addProductToUpdateQueue(queue, job.data.product)
      return(status)
    } else {
      job.moveToFailed(status, true)
      return(status)
    }
  } else {
    return(errors)
  }
}

exports.handleFailedInsertJob = (queue, job, errorMessage) => {
  
  job.moveToFailed('failed', true)
  
  const { errors } = errorMessage

  if(errors.length === 1) {
    if (status === 429) {
      console.log('Rate limit hit')
      queue.pause.then(() => {
        setTimeout(() => {
          queue.resume()
        }, 2000)
      })
      exports.addProductToInsertQueue(queue, job.data.product)
      return(status)
    } else {
      job.moveToFailed(status, true)
      return(status)
    }
  } else {
    return(errors)
  }
}
