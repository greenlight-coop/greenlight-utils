/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-function */
import { logger } from '../src/logger'

const TEST_MESSAGE = 'test message'
const TIMESTAMP_REGEX =
  /\d{4}-[01]\d-[0-3]\dT[0-2](?:\d:[0-5]){2}\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/

describe('logger', () => {
  let spy: any

  beforeEach(() => {
    spy = jest
      .spyOn((console as any)._stdout, 'write')
      .mockImplementation(() => {})
  })

  afterEach(() => {
    spy.mockClear()
  })

  afterAll(() => {
    spy.mockRestore()
  })

  test('should log stdout', () => {
    logger.info(TEST_MESSAGE)
    expect(spy).toHaveBeenCalledTimes(1)
  })

  test('should log expected fields', () => {
    logger.info(TEST_MESSAGE)
    const logged = JSON.parse(spy.mock.calls[0][0])
    expect(logged.timestamp).toMatch(TIMESTAMP_REGEX)
    expect(logged.level).toBe('info')
    expect(logged.message).toBe(TEST_MESSAGE)
  })
})
