const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')
const app = express()
const port = 3000

const { getProduct, updateProduct, insertProduct, addProductToUpdateQueue, addProductToInsertQueue, handleFailedInsertJob, handleFailedUpdateJob } = require('./utils/consumerUtils')

const arenaConfig = require('./utils/arenaConfig')
const arena = Arena(arenaConfig.config);

const jobQueue = new Queue('get-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const updateJobQueue = new Queue('update-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
const insertJobQueue = new Queue('insert-product-events', `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)

jobQueue.process('get-product', async (job, done) => {
  try {
    const {
      data: { product },
    } = job

    const products = await getProduct(product.sku)

    if (products.length > 0) {
      const existingProduct = products[0]
      product.id = existingProduct.id
      console.log('Adding product to update queue')
      await addProductToUpdateQueue(updateJobQueue, product)
      done(null, `${product.id} was added to update queue`)
    } else {
      console.log('Adding product to insert queue')
      await addProductToInsertQueue(insertJobQueue, product)
      done(null, `${product.sku} was added to insert queue`)
    }
  } catch (e) {
      console.log(e)
      done(JSON.stringify(e))
  }
})

updateJobQueue.process('update-product', async (job, done) => {
  try {
    await updateProduct(job.data.updatedProduct)
    done(null, `${job.data.updatedProduct.id} was updated`)
  } catch(errorMessage) {
    console.log(errorMessage)
    await handleFailedUpdateJob(updateJobQueue, job, errorMessage)
    done(JSON.stringify(e))
  }
})

insertJobQueue.process('insert-product', async (job, done) => {
  try {
    await insertProduct(job.data.product)
    console.log(result)
    done(null, `${product.id} was inserted`)
  } catch(errorMessage) {
    console.log(errorMessage)
    await handleFailedInsertJob(insertJobQueue, job, errorMessage)
    done(JSON.stringify(e))
  }
})

app.use('/arena', arena)

app.listen(port, () => console.log(`Consumer app running on port ${port}`))
