// /* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import {
  addFileToInsertQueue,
  handleFailedInsertJob,
} from './utils/consumerUtils'

import {
  getFile,
  insertFile,
  formatFileForInsert,
} from './utils/moltinUtils'

import arenaConfig from './utils/arenaConfig'

require('dotenv').config()

const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')

export default function consumer() {
  const redisUrl = `redis://${process.env.redisHost}:${process.env.redisPort}`
  const jobQueue = new Queue('get-file-events', redisUrl)
  const insertJobQueue = new Queue('insert-file-events', redisUrl)

  const getJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const {
        data: { fileData },
      } = job

      const files = await getFile(fileData.name)

      if (files.length > 0) {
        reject(new Error('File already exists'))
      } else {
        await addFileToInsertQueue(insertJobQueue, fileData)
        resolve(`${fileData.name} was added to insert queue`)
      }
    } catch (e) {
      reject(new Error(JSON.stringify(e)))
    }
  })

  const insertJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const formattedFile = await formatFileForInsert(job.data.file)
      await insertFile(formattedFile)
      resolve(`${formattedFile.file_name} was inserted`)
    } catch (errorMessage) {
      await handleFailedInsertJob(insertJobQueue, job, errorMessage)
      reject(new Error(JSON.stringify(errorMessage)))
    }
  })

  const arena = Arena(arenaConfig)

  const app = express()
  const port = 3000

  jobQueue.process('get-file', getJobProcessor)
  insertJobQueue.process('insert-file', insertJobProcessor)

  app.use('/arena', arena)
  app.listen(port, () => console.log(`Consumer app running on port ${port}`))
}
