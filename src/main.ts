import * as core from '@actions/core'
import * as exec from '@actions/exec'
import os from 'node:os'
import path from 'node:path'
import { ping } from './ping'
import Debug from 'debug'

const debug = Debug('backgrond_run_and_test')

//const homeDirectory = os.homedir()
//const platformAndArch = `${process.platform}-${process.arch}`

const startWorkingDirectory = process.cwd()
// seems the working directory should be absolute to work correctly
// https://github.com/cypress-io/github-action/issues/211
const workingDirectory = core.getInput('working-directory')
  ? path.resolve(core.getInput('working-directory'))
  : startWorkingDirectory

const isWindows = (): boolean => os.platform() === 'win32'
const isUrl = (s: string): boolean => /^https?:\/\//.test(s)

debug(`working directory ${workingDirectory}`)
/**
 * Parses input command, finds the tool and
 * the runs the command.
 */
const execCommand = (
  fullCommand: string,
  waitToFinish = true,
  label = 'executing'
): Promise<number> | undefined => {
  const cwd = workingDirectory

  console.log(`${label} command "${fullCommand}"`)
  console.log(`current working directory "${cwd}"`)

  const executionCode = exec.exec('bash', ['-c', fullCommand], { cwd })
  if (waitToFinish) {
    debug(`waiting for the command to finish? ${waitToFinish}`)

    return executionCode
  }
}

/**
 * Grabs a boolean GitHub Action parameter input and casts it.
 * @param {string} name - parameter name
 * @param {boolean} defaultValue - default value to use if the parameter was not specified
 * @returns {boolean} converted input argument or default value
 */

const getInputBool = (name: string, defaultValue = false): boolean => {
  const param = core.getInput(name)
  if (param === 'true' || param === '1') {
    return true
  }
  if (param === 'false' || param === '0') {
    return false
  }

  return defaultValue
}

/**
 * The main function for the testing action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function runTest(): Promise<(number | undefined)[] | undefined> {
  let userCommand
  if (isWindows()) {
    // allow custom Windows command command
    userCommand = core.getInput('command-windows') || core.getInput('command')
  } else {
    userCommand = core.getInput('command')
  }
  if (!userCommand) {
    return
  }
  // allow commands to be separated using commas or newlines
  const separateCommands = userCommand
    .split(/,|\n/)
    .map(s => s.trim())
    .filter(Boolean)
  debug(
    `Separated ${
      separateCommands.length
    } main commands ${separateCommands.join(', ')}`
  )

  return await Promise.all(
    separateCommands.map(async command => {
      return await execCommand(command, true)
    })
  )
}

const startServersMaybe = async (): Promise<
  (number | undefined)[] | undefined
> => {
  let userStartCommand

  if (isWindows()) {
    // allow custom Windows start command
    userStartCommand = core.getInput('start-windows') || core.getInput('start')
  } else {
    userStartCommand = core.getInput('start')
  }
  if (!userStartCommand) {
    debug('No start command found')
    return
  }

  // allow commands to be separated using commas or newlines
  const separateStartCommands = userStartCommand
    .split(/,|\n/)
    .map(s => s.trim())
    .filter(Boolean)
  debug(
    `Separated ${
      separateStartCommands.length
    } start commands ${separateStartCommands.join(', ')}`
  )

  return await Promise.all(
    separateStartCommands.map(async startCommand => {
      return await execCommand(startCommand, false, `start server`)
    })
  )
}

/**
 * Pings give URL(s) until the timeout expires.
 * @param {string} waitOn A single URL or comma-separated URLs
 * @param {Number?} waitOnTimeout in seconds
 */
const waitOnUrl = async (waitOn: string, waitOnTimeout = 60): Promise<void> => {
  console.log(`waiting on "${waitOn}" with timeout of ${waitOnTimeout} seconds`)

  const waitTimeoutMs = waitOnTimeout * 1000

  const waitUrls = waitOn
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean)
  debug(`Waiting for urls ${waitUrls.join(', ')}`)

  return ping(waitUrls, waitTimeoutMs)
}

const waitOnMaybe = async (): Promise<number | void> => {
  const waitOn = core.getInput('wait-on')
  const shouldWait = getInputBool('wait-if', true)
  if (!waitOn || !shouldWait) {
    if (!shouldWait) console.log(`skip waiting on the required resources`)

    return
  }

  const waitOnTimeout = core.getInput('wait-on-timeout') || '60'
  const timeoutSeconds = parseFloat(waitOnTimeout)

  console.log(`will wait for ${timeoutSeconds} sec`)

  if (isUrl(waitOn)) {
    return waitOnUrl(waitOn, timeoutSeconds)
  }

  console.log(`waiting using command ${waitOn}`)
  return execCommand(waitOn, true)
}
/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    await startServersMaybe()
    await waitOnMaybe()
    await runTest()
    debug('all done, exiting')
    // force exit to avoid waiting for child processes,
    // like the server we have started
    // see https://github.com/actions/toolkit/issues/216
    process.exit(0)
  } catch (error: unknown) {
    // final catch - when anything goes wrong, throw an error
    // and exit the action with non-zero code
    if (error instanceof Error) {
      debug(error.message)
      debug(error.stack)

      core.setFailed(error.message)
    } else {
      debug('Unkown error happend')
      debug(error)

      core.setFailed('Unkown error happend')
    }

    process.exit(1)
  }
}
