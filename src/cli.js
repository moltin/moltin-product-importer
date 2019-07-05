import arg from 'arg'
import inquirer from 'inquirer'
import chooseAndRunImport from './main'
const {resolve} = require("path");

async function promptForMissingOptions(options) {
  const defaultTemplate = 'products'

  const questions = []
  if (!options.entity) {
    questions.push({
      type: 'list',
      name: 'entity',
      message: 'Please choose which entity to import',
      choices: ['products'],
      default: defaultTemplate,
    })
  }

  if(!options.csvPath) {
    questions.push({
      type: 'input',
      name: 'csvPath',
      message: 'Please provide the path to your CSV',
    })
  }

  if(!options.clientId) {
    questions.push({
      type: 'input',
      name: 'clientId',
      message: 'Please provide the Moltin client ID for your store',
    })
  }

  if(!options.clientSecret) {
    questions.push({
      type: 'input',
      name: 'clientSecret',
      message: 'Please provide the Moltin client secret for your store',
    })
  }

  const answers = await inquirer.prompt(questions)

  return {
    ...options,
    entity: options.entity || answers.entity,
    csvPath: answers.csvPath,
    clientId: answers.clientId,
    clientSecret: answers.clientSecret
  }
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--entity': String,
      '-e': '--entity',
      '--csvPath': String,
      '--clientId': String,
      '--clientSecret': String
    },
    {
      argv: rawArgs.slice(2),
    },
  )
  return {
    entity: args['--entity'],
    csvPath: args['--csvPath'],
    clientId: args['--clientId'],
    clientSecret: args['--clientSecret']
  }
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args)
  options = await promptForMissingOptions(options)
  const path = resolve(options.csvPath)

  global.csvPath = path
  global.clientId = options.clientId
  global.clientSecret = options.clientSecret
  await chooseAndRunImport(options.entity)
}