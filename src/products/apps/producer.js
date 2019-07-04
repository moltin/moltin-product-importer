require('dotenv').config()
const Queue = require('bull')
const express = require('express')

const app = express()
const port = 4000

const { getProductsFromCSV, addProductsToGetQueue } = require('./utils/producerUtils')

const CSVLocation = './products.csv'

const createQueue = (name) => {
  const jobQueue = new Queue(name, `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`)
  return jobQueue
}

const jobQueue = createQueue('get-product-events')

app.get('/produceGetJobs', async (req, res) => {
  console.log('Parsing products CSV')
  const products = await getProductsFromCSV(CSVLocation)
  console.log(`${products.length} products parsed`)

  await addProductsToGetQueue(jobQueue, products)
  const count = await jobQueue.count()
  console.log(`job count is ${count}`)
  res.send('Done!')
})

app.listen(port, () => console.log(`Producer app running on port ${port}`))
