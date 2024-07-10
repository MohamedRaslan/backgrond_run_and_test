import Debug from 'debug'
import waitOn from 'wait-on'
const debug = Debug('backgrond_run_and_test')

/**
 * A small utility for checking when resources responds,
 * it uses the wait-on ( https://www.npmjs.com/package/wait-on )uder the under
 **/
export const ping = async (
  resource: string | string[],
  timeout: number,
  expectedStatus = 200,
  isInsecure = true,
  isLogging = true
): Promise<void> => {
  const validateStatus =
    expectedStatus !== 200
      ? (status: number) => status === expectedStatus
      : (status: number) => (status >= 200 && status < 300) || status === 304

  const waitOpts = {
    resources: Array.isArray(resource) ? resource : [resource],
    interval: 1000,
    window: 1000,
    timeout,
    verbose: isLogging,
    strictSSL: !isInsecure,
    log: isLogging,
    headers: {},
    validateStatus
  }

  // Usage with async await
  try {
    debug('Start waiting on the requested resources')
    await waitOn(waitOpts)
    debug('Finished waiting on the requested resources successfully')

    // once here, all resources are available
  } catch (err) {
    debug(`Failed to wait on the requested resources`)
    debug(err)
    throw Error('Failed to wait on the requested resources')
  }
}
