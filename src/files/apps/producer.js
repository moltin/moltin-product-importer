/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import {
  getFilesFromCSV,
  addFileDataToGetQueue,
  addFileDataToAssociateQueue,
  addMainImageToAssociateQueue,
  formatFileMeta,
  formatMainImageMeta,
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

const getJobQueue = createQueue('get-file-events')
const associateJobQueue = createQueue('associate-file-events')
const associateMainImagesJobQueue = createQueue('associate-main-image-events')

export default function producer() {
  const app = express()
  const port = 4000

  app.get('/insertOrUpdate', async (req, res) => {
    try {
      const fileMeta = await getFilesFromCSV(CSVLocation)
      const formattedFileMeta = await formatFileMeta(fileMeta)
      await addFileDataToGetQueue(getJobQueue, formattedFileMeta)
      const count = await getJobQueue.count()
      console.log(`job count is ${count}`)

      res.send('Done!\n')
    } catch (e) {
      res.send(JSON.stringify(e))
    }
  })

  app.get('/associateFiles', async (req, res) => {
    try {
      const fileMeta = await getFilesFromCSV(CSVLocation)
      const formattedFileMeta = await formatFileMeta(fileMeta)
      await addFileDataToAssociateQueue(associateJobQueue, formattedFileMeta)
      const count = await associateJobQueue.count()
      console.log(`job count is ${count}`)

      res.send('Done!\n')
    } catch (e) {
      res.send(JSON.stringify(e))
    }
  })

  app.get('/associateMainImage', async (req, res) => {
    try {
      const fileMeta = await getFilesFromCSV(CSVLocation)
      const formattedMainImageMeta = await formatMainImageMeta(fileMeta)
      await addMainImageToAssociateQueue(associateMainImagesJobQueue, formattedMainImageMeta)
      const count = await getJobQueue.count()
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
