// /* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import {
  addFileToInsertQueue,
  handleFailedInsertJob,
} from './utils/consumerUtils'

import {
  getFile,
  insertFile,
  formatFileForInsert,
  associateFile,
  associateMainImage,
  findFileId,
  findProduct,
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
  const associateJobQueue = new Queue('associate-file-events', redisUrl)
  const associateMainImageJobQueue = new Queue('associate-main-image-events', redisUrl)

  const getJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const {
        data: { fileData },
      } = job
      const files = await getFile(fileData.name)

      if (files.length > 0) {
        reject(new Error('file already exists'))
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

  const associateJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const { fileData } = job.data
      const fileId = await findFileId(fileData.name)
      const matchingProductsArray = await findProduct(fileData.sku)

      if (matchingProductsArray.length === 1) {
        const productId = matchingProductsArray[0].id
        await associateFile(fileId, productId)
        resolve('file was associated with product')
      } else {
        resolve('file could not be associated with the product')
      }
    } catch (errorMessage) {
      await handleFailedInsertJob(insertJobQueue, job, errorMessage)
      reject(new Error(JSON.stringify(errorMessage)))
    }
  })

  const associateMainImageJobProcessor = job => new Promise(async (resolve, reject) => {
    try {
      const { mainImageData } = job.data
      const newMainImageData = mainImageData[0]
      const fileId = await findFileId(newMainImageData.name)
      const matchingProductsArray = await findProduct(newMainImageData.sku)

      if (matchingProductsArray.length === 1) {
        const productId = matchingProductsArray[0].id
        await associateMainImage(fileId, productId)
        resolve('file was associated with product')
      } else {
        resolve('file could not be associated with the product')
      }
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
  associateJobQueue.process('associate-file', associateJobProcessor)
  associateMainImageJobQueue.process('associate-main-image', associateMainImageJobProcessor)

  app.use('/arena', arena)
  app.listen(port, () => console.log(`Consumer app running on port ${port}`))
}
