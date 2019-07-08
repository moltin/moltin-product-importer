/* eslint no-console: ["error", { allow: ["warn", "log"] }] */
import {
  addProductToUpdateQueue,
  addProductToInsertQueue,
  handleFailedInsertJob,
  handleFailedUpdateJob,
} from './utils/consumerUtils'

import {
  getProduct,
  updateProduct,
  insertProduct,
  formatProductForUpdate,
  formatProductForInsert,
  findProductId,
} from './utils/moltinUtils'

import arenaConfig from './utils/arenaConfig'

require('dotenv').config()

const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')

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

export default function consumer() {
  const redisUrl = `redis://${process.env.redisHost}:${process.env.redisPort}`
  const jobQueue = new Queue('get-product-events', redisUrl)
  const updateJobQueue = new Queue('update-product-events', redisUrl)
  const insertJobQueue = new Queue('insert-product-events', redisUrl)

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
      const id = await findProductId(job.data.updatedProduct)
      const formattedProduct = await formatProductForUpdate(id, job.data.updatedProduct)
      await updateProduct(formattedProduct)
      resolve(`${formattedProduct.id} was updated`)
      resolve()
    } catch (errorMessage) {
      console.log(errorMessage)
      await handleFailedUpdateJob(updateJobQueue, job, errorMessage)
      reject(new Error(JSON.stringify(errorMessage)))
    }
  })

  const insertProductProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const formattedProduct = await formatProductForInsert(job.data.product)
      await insertProduct(formattedProduct)
      resolve(`${formattedProduct.sku} was inserted`)
    } catch (errorMessage) {
      await handleFailedInsertJob(insertJobQueue, job, errorMessage)
      reject(new Error(JSON.stringify(errorMessage)))
    }
  })

  const arena = Arena(arenaConfig)

  const app = express()
  const port = 3000

  jobQueue.process('get-product', getJobProcessor)
  updateJobQueue.process('update-product', updateJobProcessor)
  insertJobQueue.process('insert-product', insertProductProcessor)

  app.use('/arena', arena)
  app.listen(port, () => console.log(`Consumer app running on port ${port}`))
}
