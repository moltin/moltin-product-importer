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
