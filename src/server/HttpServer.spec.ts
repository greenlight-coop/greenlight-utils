/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/consistent-function-scoping */
import { Application, Request } from 'express'
import createError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { mock } from 'jest-mock-extended'
import testRequest from 'supertest'
import { Logger } from 'winston'

import { Context } from './AbstractServer'
import { makeExpress } from './express'
import { HttpMethod, HttpServer } from './HttpServer'

let app: Application
let logger: Logger
let server: HttpServer

const TEST_RESPONSE = 'test response'

let invoked: boolean

describe('HttpServer', () => {
  beforeEach(() => {
    invoked = false
    app = makeExpress()
    logger = mock<Logger>()
    server = new HttpServer(app, logger)
  })

  const callback = (request: Request, context: Context): string => {
    expect(request).not.toBeNull()
    expect(context).not.toBeNull()
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
      const errorCallback = (): void => {
        throw createError(StatusCodes.BAD_REQUEST)
      }
      server.register({
        method: HttpMethod.GET,
        path: '/',
        callback: errorCallback
      })
      await testRequest(app).get('/').send().expect(StatusCodes.BAD_REQUEST)
    })

    test('should automatically translate an error without a status code to an INTERNAL_SERVER_ERROR', async () => {
      const errorCallback = (): void => {
        throw new Error('Non-HTTP error')
      }
      server.register({
        method: HttpMethod.GET,
        path: '/',
        callback: errorCallback
      })
      await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })

  test('exposes a health endpoint', async () => {
    await testRequest(app).get('/healthz').send().expect(StatusCodes.OK)
  })
})
