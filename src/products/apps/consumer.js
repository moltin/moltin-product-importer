const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')

const app = express()
const port = 3000

const {
  addProductToUpdateQueue,
  addProductToInsertQueue,
  handleFailedInsertJob,
  handleFailedUpdateJob,
} = require('./utils/consumerUtils')

const {
  getProduct,
  updateProduct,
  insertProduct,
} = require('./utils/moltinUtils')

const arenaConfig = require('./utils/arenaConfig')

const arena = Arena(arenaConfig.config)

const jobQueue = new Queue('get-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const updateJobQueue = new Queue('update-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const insertJobQueue = new Queue('insert-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)

// jobQueue.on('global:completed', (jobId, result) => {
//   console.log(`Job ${jobId} completed! Result: ${result}`)
//   jobQueue.getJob(jobId).then((job) => {
//     job.remove()
//   })
// })

// updateJobQueue.on('global:completed', (jobId, result) => {
//   console.log(`Job ${jobId} completed! Result: ${result}`)
//   updateJobQueue.getJob(jobId).then((job) => {
//     job.remove()
//   })
// })

// updateJobQueue.on('global:failed', (jobId, err) => {
//   console.log(`Job ${jobId} failed! Error: ${err}`)
//   updateJobQueue.getJob(jobId).then((job) => {
//     job.remove()
//   })
// })

// insertJobQueue.on('global:completed', (jobId, result) => {
//   console.log(`Job ${jobId} completed! Result: ${result}`)
//   insertJobQueue.getJob(jobId).then((job) => {
//     job.remove()
//   })
// })

// insertJobQueue.on('global:failed', (jobId, err) => {
//   console.log(`Job ${jobId} failed! Error: ${err}`)
//   insertJobQueue.getJob(jobId).then((job) => {
//     job.remove()
//   })
// })

const getJobProcessor = job => new Promise(async (resolve, reject) => {
  try {
    const {
      data: { product },
    } = job

    const products = await getProduct(product.sku)

    if (products.length > 0) {
      const existingProduct = products[0]
      product.id = existingProduct.id
      await addProductToUpdateQueue(updateJobQueue, product)
      resolve(`${product.id} was added to update queue`)
    } else {
      await addProductToInsertQueue(insertJobQueue, product)
      resolve(`${product.sku} was added to insert queue`)
    }
  } catch (e) {
    reject(JSON.stringify(e))
  }
})

const updateJobProcessor = job => new Promise(async (resolve, reject) => {
  try {
    await updateProduct(job.data.updatedProduct)
    resolve(`${job.data.updatedProduct.id} was updated`)
  } catch (errorMessage) {
    const result = await handleFailedUpdateJob(updateJobQueue, job, errorMessage)
    reject(new Error(JSON.stringify(result)))
  }
})

const insertProductProcessor = job => new Promise(async (resolve, reject) => {
  try {
    await insertProduct(job.data.product)
    resolve(`${job.data.product.sku} was inserted`)
  } catch (errorMessage) {
    const result = await handleFailedInsertJob(insertJobQueue, job, errorMessage)
    reject(new Error(JSON.stringify(result)))
  }
})

jobQueue.process('get-product', getJobProcessor)
updateJobQueue.process('update-product', updateJobProcessor)
insertJobQueue.process('insert-product', insertProductProcessor)

app.use('/arena', arena)
app.listen(port, () => console.log(`Consumer app running on port ${port}`))
