import { mock } from 'jest-mock-extended'
import request from 'supertest'
import { Logger } from 'winston'

import { makeExpress } from '../../src/server/express'
import { Server } from '../../src/server/Server'

const app = makeExpress()
const logger = mock<Logger>()
const server = new Server(app, logger)

describe('Server', () => {
  describe('register', () => {
    test('should add a callback invoked by the framework', async () => {
      let invoked = false
      const handler = {
        callback() {
          invoked = true
        }
      }
      server.register(handler)
      await request(app).get('/').expect(200)
      expect(invoked).toBe(true)
    })
  })
})
