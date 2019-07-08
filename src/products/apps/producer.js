/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import {
  getProductsFromCSV,
  addProductsToGetQueue,
  analyseProducts,
  createMissingFlowData,
  analyseProductCoreData,
} from './utils/producerUtils'

import {
  findMoltinProductFlow,
  createProductsFlow,
} from './utils/moltinUtils'

require('dotenv').config()
const Queue = require('bull')
const express = require('express')
const redis = require('redis')

const CSVLocation = process.env.csvPath
const redisUrl = `redis://${process.env.redisHost}:${process.env.redisPort}`

const createQueue = (name) => {
  const jobQueue = new Queue(name, redisUrl)
  return jobQueue
}

const jobQueue = createQueue('get-product-events')

export default function producer() {
  const app = express()
  const port = 4000

  app.get('/', async (req, res) => {
    try {
      // Parse the CSV rows
      const products = await getProductsFromCSV(CSVLocation)
      const missingCoreData = await analyseProductCoreData(products[0])

      if (missingCoreData.length > 0) {
        console.log(`Your CSV row is missing the following required Moltin product fields, any inserts will therefore fail:\n${missingCoreData}`)
      }

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

      res.send('Done!\n')
    } catch (e) {
      res.send(JSON.stringify(e))
    }
  })

  app.get('/flushJobs', async (req, res) => {
    const client = await redis.createClient()
    await client.flushall()
    res.send('All jobs have been flushed from Redis\n')
  })

  app.listen(port, () => console.log(`Producer app running on port ${port}`))
}
