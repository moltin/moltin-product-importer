// /* eslint no-console: ["error", { allow: ["warn", "log"] }] */
import {
  addFileToUpdateQueue,
  addFileToInsertQueue,
  handleFailedInsertJob,
  handleFailedUpdateJob,
} from './utils/consumerUtils'

import {
  getFile,
  updateFile,
  insertFile,
  formatFileForUpdate,
  formatFileForInsert,
  findFileId,
} from './utils/moltinUtils'

import arenaConfig from './utils/arenaConfig'

require('dotenv').config()

const Queue = require('bull')
const Arena = require('bull-arena')
const express = require('express')

export default function consumer() {
  const redisUrl = `redis://${process.env.redisHost}:${process.env.redisPort}`
  const jobQueue = new Queue('get-file-events', redisUrl)
  const updateJobQueue = new Queue('update-file-events', redisUrl)
  const insertJobQueue = new Queue('insert-file-events', redisUrl)

  const getJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const {
        data: { fileData },
      } = job
    
      const files = await getFile(fileData.name)

      if (files.length > 0) {
        const existingFile = files[0]
        fileData.id = existingFile.id
        await addFileToUpdateQueue(updateJobQueue, fileData)
        resolve(`${fileData.id} was added to update queue`)
      } else {
        await addFileToInsertQueue(insertJobQueue, fileData)
        resolve(`${fileData.name} was added to insert queue`)
      }
    } catch (e) {
      reject(JSON.stringify(e))
    }
  })

  const updateJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const id = await findFileId(job.data.updatedFile)
      const formattedFile = await formatFileForUpdate(id, job.data.updatedFile)
      await updateFile(formattedFile)
      resolve(`${formattedFile.id} was updated`)
      resolve()
    } catch (errorMessage) {
      console.log(errorMessage)
      await handleFailedUpdateJob(updateJobQueue, job, errorMessage)
      reject(new Error(JSON.stringify(errorMessage)))
    }
  })

  const insertJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      console.log('hi')
      const formattedFile = await formatFileForInsert(job.data.file)
      console.log(formattedFile)
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
  updateJobQueue.process('update-file', updateJobProcessor)
  insertJobQueue.process('insert-file', insertJobProcessor)

  app.use('/arena', arena)
  app.listen(port, () => console.log(`Consumer app running on port ${port}`))
}
