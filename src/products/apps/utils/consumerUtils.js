var exports = module.exports = {}

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
  const { errors } = errorMessage

  if (errors.length === 1) {
    const { status } = errors[0]

    if (status === 429) {
      console.log('Rate limit hit')
      queue.pause.then(() => {
        setTimeout(() => {
          queue.resume()
        }, 2000)
      })
      exports.addProductToUpdateQueue(queue, job.data.product)
      return (status)
    }
    job.moveToFailed(status, true)
    return (status)
  }
  return (errors)
}

exports.handleFailedInsertJob = (queue, job, errorMessage) => {
  job.moveToFailed('failed', true)

  const { errors } = errorMessage
  
  if (errors.length === 1) {
    const { status } = errors[0]

    if (status === 429) {
      console.log('Rate limit hit')
      queue.pause.then(() => {
        setTimeout(() => {
          queue.resume()
        }, 2000)
      })
      exports.addProductToInsertQueue(queue, job.data.product)
      return (status)
    }
    job.moveToFailed(status, true)
    return (status)
  }
  return (errors)
}
