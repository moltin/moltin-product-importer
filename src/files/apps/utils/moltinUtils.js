require('dotenv').config()
const FormData = require('form-data')

const { MoltinClient } = require('@moltin/request')

const client = new MoltinClient({
  client_id: process.env.clientId,
  client_secret: process.env.clientSecret,
})

const MoltinGateway = require('@moltin/sdk').gateway

const Moltin = new MoltinGateway({
  client_id: process.env.clientId,
  client_secret: process.env.clientSecret,
})

export async function formatFileForUpdate(id, file) {
  const newFile = Object.assign({}, file)

  newFile.type = 'file'
  newFile.id = id

  return newFile
}

export async function findFileId(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await client.get(`files?filter=eq(file_name,${file.name})`)
      const { data } = result

      if (data.length === 1) {
        resolve(data[0].id)
      }
      reject(new Error('no file found'))
    } catch (e) {
      reject(e)
    }
  })
}

export async function formatFileForInsert(file) {
  const newFile = Object.assign({}, file)
  newFile.type = 'file'

  return newFile
}

export async function updateFile(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await Moltin.Files.Update(file.id, file)
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

async function downloadFileFromURL(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(res => res.buffer())
      .then(buffer => resolve(buffer))
      .catch(e => reject(e))
  })
}

export async function getFile(file) {
  const { data } = await Moltin.Files.Filter({ eq: { file_name: file } })
    .All()
  return data
}

export async function insertFile(file) {
  return new Promise(async (resolve, reject) => {
    try {
      const fileName = file.name
      const buffer = await downloadFileFromURL(file.url)
      const formData = new FormData()
      formData.append('file_name', fileName)
      formData.append('public', 'true')
      formData.append('file', buffer, { filename: fileName })

      const headers = {
        'Content-Type': formData.getHeaders()['content-type'],
      }

      const data = {
        body: formData,
      }

      const result = await client.post('files', data, headers)
      resolve(result)
    } catch (e) {
      reject(e)
    }
  })
}

export async function update(id, payload) {
  return new Promise(async (resolve, reject) => {
    try {
      await client.put(`files/${id}`, payload)
      resolve()
    } catch (e) {
      reject(e)
    }
  })
}
