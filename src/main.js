/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import chalk from 'chalk'
import runProductsApps from './products/index'
import runFilesApps from './files/index'

export default async function chooseAndRunImport(entity) {
  switch (entity) {
    case 'products':
      runProductsApps()
      break
    case 'files':
      runFilesApps()
      console.log('%s import is ready to run', chalk.green.bold(entity))
      console.log(chalk.yellow.bold('make sure you have already run the products import'))
      console.log('Please GET http://localhost:4000/insertOrUpdate, then get http://localhost:4000/associate')
      break
    default:
      console.log('entity not available for import')
  }
}
