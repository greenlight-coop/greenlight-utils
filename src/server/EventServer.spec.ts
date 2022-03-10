/* eslint-disable no-new */
import { CloudEvent, HTTP } from 'cloudevents'
import { mock } from 'jest-mock-extended'
import request from 'supertest'
import { Logger } from 'winston'

import { EventServer } from './EventServer'
import { makeExpress } from './express'

const app = makeExpress()
const logger = mock<Logger>()

const event = new CloudEvent({
  type: 'type',
  source: 'source',
  data: 'data'
})
const message = HTTP.structured(event)

describe('EventServer', () => {
  describe('constructor', () => {
    test('should add a callback invoked by the framework', async () => {
      let invoked = false
      const callback = () => {
        invoked = true
      }
      new EventServer(callback, app, logger)
      await request(app)
        .post('/')
        .set('content-type', message.headers['content-type'] as string)
        .send(message.body as string)
        .expect(200)
      expect(invoked).toBe(true)
    })
  })
})
