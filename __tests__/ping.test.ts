/**
 * Unit tests for src/wait.ts
 */

import { ping } from '../src/ping'
import { expect } from '@jest/globals'

describe('Ping urls', () => {
  it('Try to ping available urls', async () => {
    const urls = ['https://atomica.ai', 'https://auth.courier.atomica.ai']
    const timeout = 1000 // 1sec

    await expect(ping(urls, timeout)).resolves.not.toThrow()
  })
  it('Try to ping unavailable urls', async () => {
    const urls = [
      'http://localhost:4001',
      'http://localhost:4002',
      'http://localhost:4003'
    ]
    const timeout = 1000 // 1sec

    await expect(async () => ping(urls, timeout)).rejects.toThrow(
      'Failed to wait on the requested resources'
    )
  })

  it('Try to ping available urls with 404 status code', async () => {
    const urls = ['https://atomica.ai', 'https://auth.courier.atomica.ai']

    const timeout = 1000 // 1sec

    await expect(async () => ping(urls, timeout, 404)).rejects.toThrow(
      'Failed to wait on the requested resources'
    )
  })

  it('Try to ping available urls with 200 status code, and not secure', async () => {
    const urls = ['https://atomica.ai', 'https://auth.courier.atomica.ai']

    const timeout = 1000 // 1sec

    await expect(ping(urls, timeout, 200, false)).resolves.not.toThrow()
  })
  it('Try to ping available url with 200 status code,scure, no logs', async () => {
    const urls = ['https://atomica.ai']

    const timeout = 1000 // 1sec

    await expect(ping(urls, timeout, 200, true, false)).resolves.not.toThrow()
  })
})
