/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

const csv = require('fast-csv')
const fs = require('fs')

const addSingleFileDataToGetQueue = async (jobQueue, fileData) => {
  jobQueue
    .add('get-file', {
      title: `Getting file ${fileData.name}`,
      fileData,
    })
}

const addSingleFileDataToAssociateQueue = async (jobQueue, fileData) => {
  jobQueue
    .add('associate-file', {
      title: `Associating file ${fileData.name}`,
      fileData,
    })
}

export async function getFilesFromCSV(fileLocation) {
  return new Promise((resolve, reject) => {
    try {
      const objects = []

      const reader = csv.parse({
        headers: true,
        objectMode: true,
        ignoreEmpty: true,
      })

      const fileMetaStream = fs.createReadStream(fileLocation)
      fileMetaStream.on('error', () => {
        reject(new Error('Cannot find your CSV file'))
      })

      const csvStream = reader
        .on('data', data => objects.push(data))
        .on('end', () => {
          resolve(objects)
        })
      fileMetaStream.pipe(csvStream)
    } catch (e) {
      reject(e)
    }
  })
}

export async function addFileDataToGetQueue(jobQueue, fileMeta) {
  for (let i = 0, len = fileMeta.length; i < len; i += 1) {
    const singleFileMeta = fileMeta[i]
    addSingleFileDataToGetQueue(jobQueue, singleFileMeta)
  }
}

export async function addFileDataToAssociateQueue(jobQueue, fileMeta) {
  for (let i = 0, len = fileMeta.length; i < len; i += 1) {
    const singleFileMeta = fileMeta[i]
    addSingleFileDataToAssociateQueue(jobQueue, singleFileMeta)
  }
}

export async function formatFileMeta(fileMeta) {
  return new Promise(async (resolve, reject) => {
    try {
      const newFileMeta = await fileMeta.map((row) => {
        const allowed = ['url', 'sku']

        const filtered = Object.keys(row)
          .filter(key => allowed.includes(key))
          .reduce((obj, key) => {
            const newObj = obj
            newObj[key] = row[key]
            return newObj
          }, {})

        const filteredWithNewName = Object.assign({ name: `${filtered.sku}_main_image` }, filtered)
        return (filteredWithNewName)
      })
      resolve(newFileMeta)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}
