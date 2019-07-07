import arg from 'arg'
import inquirer from 'inquirer'
import chooseAndRunImport from './main'
const resolvePath = require("path").resolve;
const fs = require('fs')
const dotenv = require('dotenv')
const envfile = require('envfile')
const path = require('path')

async function fetchEnvFile() {
  return new Promise((resolve, reject) => {
    try {
      const result = dotenv.config({ path: '../.env' })
      if (result.error) {
        throw result.error
      }
      const r = result.parsed
      if(r.clientId && r.clientSecret && r.csvPath) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
          resolve(false)
      } else {
        reject(JSON.stringify(error));
      }
    }
  })
}

async function writeEnvVars(options) {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceObject = {
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        csvPath: options.csvPath,
      }

      const newEnv = await envfile.stringifySync(sourceObject)
      const newEnvBuffer = Buffer.from(newEnv)
      await fs.writeFileSync('./.env', newEnvBuffer)
      resolve()
    } catch(e) {
      console.log(e)
      reject(e)
    }
  })
}

async function promptForShouldChangeVars() {
  const defaultTemplate = 'no'

  const question = [{
    type: 'list',
    name: 'shouldReplaceVars',
    message: 'Would you like to change the Moltin credentials or CSV path?',
    choices: ['yes', 'no'],
    default: defaultTemplate,
  }]

  const answer = await inquirer.prompt(question)

  return {
    shouldReplaceVars: answer.shouldReplaceVars
  }
}

async function promptForMissingOptions(options) {
  
  let questions = []

  if(!options.csvPath) {
    questions.push({
      type: 'input',
      name: 'csvPath',
      message: `Please provide a path to your CSV, your current directory is ${path.join(__dirname, '../')}`,
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
    csvPath: answers.csvPath,
    clientId: answers.clientId,
    clientSecret: answers.clientSecret
  }
}

async function promptForMissingEntity(options) {
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

  const answers = await inquirer.prompt(questions)

  return {
    entity: options.entity || answers.entity
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

async function collectAndWriteEnvVars(options) {
  return new Promise(async (resolve, reject) => {
    try {
      options = await promptForMissingOptions(options)
      const relativeCsvPath = resolvePath(options.csvPath)
      options.csvPath = relativeCsvPath
      await writeEnvVars(options)
      resolve(options)
    } catch(e) {
      reject(e)
    }
  })
}

export async function cli(args) {
  try {
    let options = parseArgumentsIntoOptions(args)
    const { entity } = await promptForMissingEntity(args)
    const env = await fetchEnvFile()
    if(env) {
      const { shouldReplaceVars } = await promptForShouldChangeVars()
      if(shouldReplaceVars === 'yes') {
        await collectAndWriteEnvVars(options)
        chooseAndRunImport(entity)
      } else {
        chooseAndRunImport(entity)
      }
    } else {
      await collectAndWriteEnvVars(options)
      chooseAndRunImport(entity)
    }
  } catch(e) {
    console.error(e)
  }
}