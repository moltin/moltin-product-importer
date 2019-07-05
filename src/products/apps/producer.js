const Queue = require('bull')
const express = require('express')

const app = express()
const port = 4000

const {
  getProductsFromCSV,
  addProductsToGetQueue,
  analyseProducts,
  createMissingFlowData,
  analyseProductCoreData,
} = require('./utils/producerUtils')

const {
  findMoltinProductFlow,
  createProductsFlow,
} = require('./utils/moltinUtils')

const CSVLocation = global.csvPath

const createQueue = (name) => {
  const jobQueue = new Queue(name, 'redis://127.0.0.1:6379')
  return jobQueue
}

const jobQueue = createQueue('get-product-events')

app.get('/produceGetJobs', async (req, res) => {
  // Parse the CSV rows
  const products = await getProductsFromCSV(CSVLocation)
  console.log(`${products.length} products parsed`)

  const missingCoreData = await analyseProductCoreData(products[0])

  if (missingCoreData.length > 0) {
    console.log(`Your CSV row is missing the following required Moltin product fields, any inserts will therefore fail:\n${missingCoreData}`)
  }
  // Check if there are fields in the row which don't exist
  const extraFieldsToCreate = await analyseProducts(products[0])

  if (extraFieldsToCreate.length > 0) {
    console.log('your Moltin account is missing some fields on products found in the CSV, creating those now')
    let productsFlow = await findMoltinProductFlow()

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
