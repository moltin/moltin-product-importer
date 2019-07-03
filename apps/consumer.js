const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')

const app = express()
const port = 3000

const {
  getProduct,
  updateProduct,
  insertProduct,
  addProductToUpdateQueue,
  addProductToInsertQueue,
  handleFailedInsertJob,
  handleFailedUpdateJob,
} = require('./utils/consumerUtils')

const arenaConfig = require('./utils/arenaConfig')

const arena = Arena(arenaConfig.config)

const jobQueue = new Queue('get-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const updateJobQueue = new Queue('update-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const insertJobQueue = new Queue('insert-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)

jobQueue.on('global:completed', (jobId, result) => {
  console.log(`Job ${jobId} completed! Result: ${result}`)
  jobQueue.getJob(jobId).then((job) => {
    job.remove()
  })
})

updateJobQueue.on('global:completed', (jobId, result) => {
  console.log(`Job ${jobId} completed! Result: ${result}`)
  updateJobQueue.getJob(jobId).then((job) => {
    job.remove()
  })
})

insertJobQueue.on('global:completed', (jobId, result) => {
  console.log(`Job ${jobId} completed! Result: ${result}`)
  insertJobQueue.getJob(jobId).then((job) => {
    job.remove()
  })
})

jobQueue.process('get-product', async (job, done) => {
  try {
    const {
      data: { product },
    } = job

    const products = await getProduct(product.sku)

    if (products.length > 0) {
      const existingProduct = products[0]
      product.id = existingProduct.id
      await addProductToUpdateQueue(updateJobQueue, product)
      done(null, `${product.id} was added to update queue`)
    } else {
      await addProductToInsertQueue(insertJobQueue, product)
      done(null, `${product.sku} was added to insert queue`)
    }
  } catch (e) {
    done(JSON.stringify(e))
  }
})

updateJobQueue.process('update-product', async (job, done) => {
  try {
    await updateProduct(job.data.updatedProduct)
    done(null, `${job.data.updatedProduct.id} was updated`)
  } catch (errorMessage) {
    const result = await handleFailedUpdateJob(updateJobQueue, job, errorMessage)
    done(JSON.stringify(result))
  }
})

insertJobQueue.process('insert-product', async (job, done) => {
  try {
    await insertProduct(job.data.product)
    done(null, `${job.data.product.id} was inserted`)
  } catch (errorMessage) {
    const result = await handleFailedInsertJob(insertJobQueue, job, errorMessage)
    done(JSON.stringify(result))
  }
})

app.use('/arena', arena)

app.listen(port, () => console.log(`Consumer app running on port ${port}`))