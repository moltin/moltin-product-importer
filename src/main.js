/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import chalk from 'chalk'
import runProductsApps from './products/index'

export default async function chooseAndRunImport(entity) {
  switch (entity) {
    case 'products':
      runProductsApps()
      break
    default:
      console.log('entity not available for import')
  }

  console.log('%s import is ready to run', chalk.green.bold(entity))
  console.log('Please GET localhost:4000 to begin')
}
