/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable unicorn/consistent-function-scoping */
/* eslint-disable no-new */
import { Application, Request } from 'express'
import createError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import testRequest from 'supertest'
import { Logger } from 'winston'

import { getLogger } from '../logger'
import { Context } from './AbstractServer'
import { makeExpress } from './express'
import { HttpMethod, HttpServer } from './HttpServer'

process.env.DEBUG = 'true'

let app: Application
let logger: Logger
let server: HttpServer

const TEST_RESPONSE = 'test response'

let invoked: boolean

describe('HttpServer', () => {
  beforeEach(() => {
    invoked = false
    app = makeExpress()
    logger = getLogger()
    server = new HttpServer(app, logger)
  })

  const callback = (request: Request, context: Context): string => {
    expect(request).not.toBeNull()
    expect(context).not.toBeNull()
    context.logger.info('IN CALLBACK!!!')
    invoked = true
    return TEST_RESPONSE
  }

  describe('register', () => {
    test('should add a callback invoked by the framework', async () => {
      server.register({ method: HttpMethod.GET, path: '/', callback })
      await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.OK)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(TEST_RESPONSE)
      expect(invoked).toBe(true)
    })

    test.each(Object.values(HttpMethod))(
      'should support registering a %s handler',
      async (method) => {
        server.register({ method, path: '/', callback })
        await (testRequest(app) as any)[method.toLowerCase()]('/').send()
        expect(invoked).toBe(true)
      }
    )

    test('should automatically translate an HttpError thrown within callback', async () => {
      const errorCallback = (request: Request): void => {
        throw createError(StatusCodes.BAD_REQUEST)
      }
      server.register({
        method: HttpMethod.GET,
        path: '/',
        callback: errorCallback
      })
      const response = await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.BAD_REQUEST)
    })

    test('should automatically translate an error without a status code to an INTERNAL_SERVER_ERROR', async () => {
      const errorCallback = (request: Request): void => {
        throw new Error('Non-HTTP error')
      }
      server.register({
        method: HttpMethod.GET,
        path: '/',
        callback: errorCallback
      })
      const response = await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })
})
