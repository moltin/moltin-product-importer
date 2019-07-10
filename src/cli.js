/* eslint no-console: ["error", { allow: ["warn", "log"] }] */

import arg from 'arg'
import inquirer from 'inquirer'
import fs from 'fs'
import dotenv from 'dotenv'
import envfile from 'envfile'
import path from 'path'
import figlet from 'figlet'
import chalk from 'chalk'
import { merge } from 'lodash'
import chooseAndRunImport from './main'

const resolvePath = require('path').resolve

async function fetchEnvFile() {
  return new Promise((resolve, reject) => {
    try {
      const result = dotenv.config({ path: './.env' })
      if (result.error) {
        throw result.error
      }
      const r = result.parsed
      if (r.clientId && r.clientSecret && r.csvPath) {
        resolve(true)
      } else {
        resolve(false)
      }
    } catch (err) {
      if (err.code === 'ENOENT') {
        resolve(false)
      } else {
        reject(JSON.stringify(err))
      }
    }
  })
}

async function promptForRedisDefault() {
  const defaultTemplate = 'yes'

  const question = [{
    type: 'list',
    name: 'isRedisDefault',
    message: 'Do you have Redis running using the default port and host?',
    choices: ['yes', 'no'],
    default: defaultTemplate,
  }]

  const answer = await inquirer.prompt(question)

  return answer.isRedisDefault
}

async function promptForRedisConfig() {
  const questions = [
    {
      type: 'input',
      name: 'redisPort',
      message: 'What port is Redis running on?',
    }, {
      type: 'input',
      name: 'redisHost',
      message: 'What host is Redis running on?',
    },
  ]

  const answers = await inquirer.prompt(questions)

  return {
    redisPort: answers.redisPort,
    redisHost: answers.redisHost,
  }
}

async function writeEnvVars(options) {
  return new Promise(async (resolve, reject) => {
    try {
      const sourceObject = {
        clientId: options.clientId,
        clientSecret: options.clientSecret,
        csvPath: options.csvPath,
        redisHost: options.redisHost,
        redisPort: options.redisPort,
      }

      const newEnv = await envfile.stringifySync(sourceObject)

      const newEnvBuffer = Buffer.from(newEnv)
      await fs.writeFileSync('./.env', newEnvBuffer)
      resolve()
    } catch (e) {
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
    message: 'Would you like to change the Moltin credentials, CSV path or Redis config?',
    choices: ['yes', 'no'],
    default: defaultTemplate,
  }]

  const answer = await inquirer.prompt(question)

  return {
    shouldReplaceVars: answer.shouldReplaceVars,
  }
}

async function promptForMissingOptions(options) {
  const questions = []

  if (!options.csvPath) {
    questions.push({
      type: 'input',
      name: 'csvPath',
      message: `Please provide a path to your CSV, your current directory is ${path.join(__dirname, '../')}`,
    })
  }

  if (!options.clientId) {
    questions.push({
      type: 'input',
      name: 'clientId',
      message: 'Please provide the Moltin client ID for your store',
    })
  }

  if (!options.clientSecret) {
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
    clientSecret: answers.clientSecret,
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
      choices: ['products', 'files'],
      default: defaultTemplate,
    })
  }

  const answers = await inquirer.prompt(questions)

  return {
    entity: options.entity || answers.entity,
  }
}

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--entity': String,
      '-e': '--entity',
      '--csvPath': String,
      '--clientId': String,
      '--clientSecret': String,
    },
    {
      argv: rawArgs.slice(2),
    },
  )
  return {
    entity: args['--entity'],
    csvPath: args['--csvPath'],
    clientId: args['--clientId'],
    clientSecret: args['--clientSecret'],
  }
}

async function addToOptions(kv, options) {
  await merge(options, kv)
}

async function collectAndWriteEnvVars(options) {
  return new Promise(async (resolve, reject) => {
    try {
      let collectedOptions = await promptForMissingOptions(options)
      const relativeCsvPath = resolvePath(collectedOptions.csvPath)
      collectedOptions = await addToOptions({ csvPath: relativeCsvPath }, collectedOptions)
      const isRedisDefault = await promptForRedisDefault()

      if (isRedisDefault === 'no') {
        const redisConfig = await promptForRedisConfig()
        collectedOptions = await addToOptions(
          { redisHost: redisConfig.redisHost },
          collectedOptions,
        )
        collectedOptions = await addToOptions(
          { redisPort: redisConfig.redisPort },
          collectedOptions,
        )
      } else {
        collectedOptions = await addToOptions({ redisHost: '127.0.0.1' }, collectedOptions)
        collectedOptions = await addToOptions({ redisPort: '6379' }, collectedOptions)
      }

      await writeEnvVars(collectedOptions)
      resolve(collectedOptions)
    } catch (e) {
      reject(e)
    }
  })
}

export default async function cli(args) {
  try {
    console.log(chalk.green(figlet.textSync('moltin-importer', { horizontalLayout: 'full' })))
    const options = parseArgumentsIntoOptions(args)
    const { entity } = await promptForMissingEntity(args)
    const env = await fetchEnvFile()
    if (env) {
      const { shouldReplaceVars } = await promptForShouldChangeVars()
      if (shouldReplaceVars === 'yes') {
        await collectAndWriteEnvVars(options)
        dotenv.config({ path: './.env' })
        chooseAndRunImport(entity)
      } else {
        dotenv.config({ path: './.env' })
        chooseAndRunImport(entity)
      }
    } else {
      await collectAndWriteEnvVars(options)
      chooseAndRunImport(entity)
    }
  } catch (e) {
    console.log(e)
  }
}
