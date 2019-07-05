require('dotenv').config()
const Queue = require('bull')
const express = require('express')

const app = express()
const port = 4000

const {
  getProductsFromCSV,
  addProductsToGetQueue,
  analyseProducts,
  createMissingFlowData,
} = require('./utils/producerUtils')

const {
  findMoltinProductFlow,
  createProductsFlow,
} = require('./utils/moltinUtils')

const CSVLocation = process.env.PRODUCTS_CSV

const createQueue = (name) => {
  const jobQueue = new Queue(name, `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
  return jobQueue
}

const jobQueue = createQueue('get-product-events')

app.get('/produceGetJobs', async (req, res) => {
  // Parse the CSV rows
  const products = await getProductsFromCSV(CSVLocation)
  console.log(`${products.length} products parsed`)

  // Check if there are fields in the row which don't exist
  const extraFieldsToCreate = await analyseProducts(products[0])

  if (extraFieldsToCreate.length > 0) {
    const productsFlow = await findMoltinProductFlow()

    if (productsFlow === undefined) {
      productsFlow = await createProductsFlow()
    }

    await createMissingFlowData(productsFlow.id, extraFieldsToCreate)
  }

  await addProductsToGetQueue(jobQueue, products)
  const count = await jobQueue.count()
  console.log(`job count is ${count}`)

  res.send('Done!')
})

app.listen(port, () => console.log(`Producer app running on port ${port}`))
