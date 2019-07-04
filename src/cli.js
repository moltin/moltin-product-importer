import arg from 'arg'
import inquirer from 'inquirer'
import dotenv from 'dotenv'
import chooseAndRunImport from './main'

async function promptForMissingOptions(options) {
  const defaultTemplate = 'products'

  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    }
  }

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

  const answers = await inquirer.prompt(questions)

  return {
    ...options,
    entity: options.entity || answers.entity,
  }
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--entity': String,
      '-e': '--entity',
      '--yes': Boolean,
    },
    {
      argv: rawArgs.slice(2),
    },
  )
  return {
    entity: args['--entity'],
    skipPrompts: args['--yes'] || false,
  }
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args)
  options = await promptForMissingOptions(options)
  await chooseAndRunImport(options.entity)
}
