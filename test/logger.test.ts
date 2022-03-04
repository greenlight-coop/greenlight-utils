import { logger } from '../src/logger'

describe('logger', () => {
  test('should provide a usable logger', () => {
    logger.info('testing...')
  })
})
