/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

export async function addFileToInsertQueue(jobQueue, file) {
  jobQueue
    .add('insert-file', {
      title: `Inserting file ${file.name}`,
      file,
    })
}

export async function handleFailedInsertJob(queue, job, errorMessage) {
  job.moveToFailed('failed', true)

  const { errors } = errorMessage
  console.log(errorMessage)

  if (errors.length === 1) {
    const { status } = errors[0]

    if (status === 429) {
      console.log('Rate limit hit')
      queue.pause.then(() => {
        setTimeout(() => {
          queue.resume()
        }, 2000)
      })
      exports.addFileToInsertQueue(queue, job.data.file)
      return (status)
    }
    job.moveToFailed(status, true)
    return (status)
  }
  return (errors)
}
