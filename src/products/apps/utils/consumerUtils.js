/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

export async function addProductToInsertQueue(jobQueue, product) {
  jobQueue
    .add('insert-product', {
      title: `Inserting product ${product.sku}`,
      product,
    })
}

export async function addProductToUpdateQueue(jobQueue, updatedProduct) {
  jobQueue
    .add('update-product', {
      title: `Updating product ${updatedProduct.sku}`,
      updatedProduct,
    })
}

export async function handleFailedUpdateJob(queue, job, errorMessage) {
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

export async function handleFailedInsertJob(queue, job, errorMessage) {
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
