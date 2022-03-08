import request from 'supertest'

import { makeExpress } from '../../src/server/express'

const app = makeExpress()

describe('Server', () => {
  describe('register', () => {
    test('should add a callback invoked by the framework', async () => {
      await request(app)
        .get('/')
        // .expect('Content-Type', 'text/html; charset=utf-8')
        // .expect('Hello World!')
        .expect(404)
    })
  })
})
