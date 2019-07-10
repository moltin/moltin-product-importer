/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import {
  getFilesFromCSV,
  addFileDataToGetQueue,
} from './utils/producerUtils'

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

const jobQueue = createQueue('get-file-events')

export default function producer() {
  const app = express()
  const port = 4000

  app.get('/', async (req, res) => {
    try {
      // Parse the CSV rows
      const fileMeta = await getFilesFromCSV(CSVLocation)

      await addFileDataToGetQueue(jobQueue, fileMeta)
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
