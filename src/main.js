/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import chalk from 'chalk'
import runProductsApps from './products/index'
import runFilesApps from './files/index'

const messagesForFilesImport = entity => {
  console.log('%s import is ready to run', chalk.green.bold(entity))
  console.log(chalk.yellow.bold('Make sure you have already run the products import'))
  console.log(chalk.yellow.bold('Make sure your image urls have image_url in their column headers'))
  console.log(chalk.yellow.bold('Make sure your main image url has main_image_url for its column header\n'))
  console.log('Please GET http://localhost:4000/insertOrUpdate\n')
  console.log('Then get http://localhost:4000/associateFiles\n')
  console.log('Lastly get http://localhost:4000/associateMainImage\n')
}

export default async function chooseAndRunImport(entity) {
  switch (entity) {
    case 'products':
      runProductsApps()
      break
    case 'files':
      runFilesApps()
      messagesForFilesImport(entity)
      break
    default:
      console.log('entity not available for import')
  }
}
