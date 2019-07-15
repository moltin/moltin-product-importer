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

export async function addMainImageToAssociateQueue(jobQueue, mainImageData) {
  jobQueue
    .add('associate-main-image', {
      title: `Associating main image ${mainImageData.name}`,
      mainImageData,
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

async function checkNumberOfUrls(fileMeta) {
  return new Promise(async (resolve, reject) => {
    try {
      const row = fileMeta[0]
      const keysContainingUrl = Object.keys(row).filter(key => key.indexOf('image_url') >= 0)
      resolve(keysContainingUrl.length)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

export async function addFileDataToGetQueue(jobQueue, fileMeta) {
  const numberOfUrls = await checkNumberOfUrls(fileMeta)

  for (let i = 0, len = fileMeta.length; i < len; i += 1) {
    const singleFileMeta = fileMeta[i]
    const { name, sku } = fileMeta[i]
    const keysContainingUrl = Object.keys(singleFileMeta).filter(key => key.indexOf('image_url') >= 0)

    for (i = 0; i < numberOfUrls; i += 1) {
      try {
        const first = keysContainingUrl.shift()

        const entity = {
          name: `${name}_${i}`,
          sku,
          url: singleFileMeta[first],
        }

        if (first === 'main_image_url') {
          entity.name = name
        }

        addSingleFileDataToGetQueue(jobQueue, entity)
      } catch (e) {
        console.log('error', e)
      }
    }
  }
}

export async function addFileDataToAssociateQueue(jobQueue, fileMeta) {
  const numberOfUrls = await checkNumberOfUrls(fileMeta)

  for (let i = 0, len = fileMeta.length; i < len; i += 1) {
    const singleFileMeta = fileMeta[i]
    const { name, sku } = fileMeta[i]
    const keysContainingUrl = Object.keys(singleFileMeta).filter(key => key.indexOf('image_url') >= 0)

    for (i = 0; i < numberOfUrls; i += 1) {
      try {
        const first = keysContainingUrl.shift()

        const entity = {
          name: `${name}_${i}`,
          sku,
          url: singleFileMeta[first],
        }

        addSingleFileDataToAssociateQueue(jobQueue, entity)
      } catch (e) {
        console.log('error', e)
      }
    }
  }
}

export async function formatMainImageMeta(fileMeta) {
  return new Promise(async (resolve, reject) => {
    try {
      const newFileMeta = await fileMeta.map((row) => {
        const onlyUrls = Object.keys(row)
          .filter(keys => keys.indexOf('main_image_url') >= 0)
          .reduce((obj, key) => {
            const newObj = obj
            newObj[key] = row[key]
            return newObj
          }, {})

        const allowed = ['sku']
        const onlySku = Object.keys(row)
          .filter(key => allowed.includes(key))
          .reduce((obj, key) => {
            const newObj = obj
            newObj[key] = row[key]
            return newObj
          }, {})

        const skuAndName = Object.assign({ name: onlySku.sku }, onlySku)
        const urlsAndSkuAndName = Object.assign(onlyUrls, skuAndName)
        return (urlsAndSkuAndName)
      })
      resolve(newFileMeta)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}

export async function formatFileMeta(fileMeta) {
  return new Promise(async (resolve, reject) => {
    try {
      const newFileMeta = await fileMeta.map((row) => {
        const onlyUrls = Object.keys(row)
          .filter(keys => keys.indexOf('image_url') >= 0)
          .reduce((obj, key) => {
            const newObj = obj
            newObj[key] = row[key]
            return newObj
          }, {})

        const allowed = ['sku']
        const onlySku = Object.keys(row)
          .filter(key => allowed.includes(key))
          .reduce((obj, key) => {
            const newObj = obj
            newObj[key] = row[key]
            return newObj
          }, {})

        const skuAndName = Object.assign({ name: onlySku.sku }, onlySku)
        const urlsAndSkuAndName = Object.assign(onlyUrls, skuAndName)
        return (urlsAndSkuAndName)
      })
      resolve(newFileMeta)
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}
