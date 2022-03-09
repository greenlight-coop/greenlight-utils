/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { getLogger } from '../src/logger'

process.env.DEBUG = 'true'

const TEST_MESSAGE = 'test message'
const TIMESTAMP_REGEX =
  /\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

describe('getLogger', () => {
  let spy: any

  beforeEach(() => {
    spy = jest
      .spyOn((console as any)._stdout, 'write')
      .mockImplementation(() => {})
    process.env.DEBUG = 'false'
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  function getLogged() {
    expect(spy.mock.calls.length).toBe(1)
    return JSON.parse(spy.mock.calls[0][0])
  }

  test('should log to stdout', () => {
    getLogger().info(TEST_MESSAGE)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('should log expected fields', () => {
    getLogger().info(TEST_MESSAGE)
    const logged = getLogged()
    expect(logged.timestamp).toMatch(TIMESTAMP_REGEX)
    expect(logged.level).toBe('info')
    expect(logged.message).toBe(TEST_MESSAGE)
  })

  test.each(['error', 'warn', 'info'])(
    'should output %s level messages',
    (level) => {
      ;(getLogger() as any)[level](TEST_MESSAGE)
      const logged = getLogged()
      expect(logged.level).toBe(level)
    }
  )

  test('should not log debug level messages by default', () => {
    getLogger().debug(TEST_MESSAGE)
    expect(spy).not.toHaveBeenCalled()
  })

  test('should log debug level messages if DEBUG environment variable is set', () => {
    process.env.DEBUG = 'true'
    getLogger().debug(TEST_MESSAGE)
    const logged = getLogged()
    expect(logged.level).toBe('debug')
    expect(logged.message).toBe(TEST_MESSAGE)
  })
})
