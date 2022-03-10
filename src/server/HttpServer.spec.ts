/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable no-new */
import { Application, Request, Response } from 'express'
import createError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import testRequest from 'supertest'
import { Logger } from 'winston'

import { getLogger } from '../logger'
import { makeExpress } from './express'
import { HttpMethod, HttpServer } from './HttpServer'

let app: Application
let logger: Logger
let server: HttpServer

const TEST_RESPONSE = 'test response'

describe('HttpServer', () => {
  beforeEach(() => {
    app = makeExpress()
    logger = getLogger()
    server = new HttpServer(app, logger)
  })

  describe('register', () => {
    test('should add a callback invoked by the framework', async () => {
      let invoked = false
      const callback = (request: Request, response: Response): void => {
        expect(request).not.toBeNull()
        expect(response).not.toBeNull()
        invoked = true
        response.contentType('text')
        response.send(TEST_RESPONSE)
      }
      server.register({ method: HttpMethod.GET, path: '/', callback })
      await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.OK)
        .expect('Content-Type', 'text/plain; charset=utf-8')
        .expect(TEST_RESPONSE)
      expect(invoked).toBe(true)
    })

    test('should automatically translate an HttpError thrown within callback', async () => {
      const callback = (request: Request, response: Response): void => {
        throw createError(StatusCodes.BAD_REQUEST)
      }
      server.register({ method: HttpMethod.GET, path: '/', callback })
      const response = await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.BAD_REQUEST)
    })

    test('should automatically translate an error without a status code to an INTERNAL_SERVER_ERROR', async () => {
      const callback = (request: Request, response: Response): void => {
        throw new Error('Non-HTTP error')
      }
      server.register({ method: HttpMethod.GET, path: '/', callback })
      const response = await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })
})
