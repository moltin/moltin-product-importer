import chalk from 'chalk'

export default async function chooseAndRunImport(entity) {
  switch (entity) {
    case 'products':
      require('./products/index')
      break
    default:
      console.log('entity not available for import')
  }

  console.log('%s import is ready to run', chalk.green.bold(entity))
  console.log('Please GET localhost:4000 to begin')
}
