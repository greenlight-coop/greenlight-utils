/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable unicorn/consistent-function-scoping */
import { Application, Request } from 'express'
import createError from 'http-errors'
import { StatusCodes } from 'http-status-codes'
import { mock } from 'jest-mock-extended'
import Joi from 'joi'
import testRequest from 'supertest'
import { v4 as uuidv4 } from 'uuid'
import { Logger } from 'winston'

import { Context } from './AbstractServer'
import { makeExpress } from './express'
import { HttpMethod, HttpServer } from './HttpServer'

let app: Application
let logger: Logger
let server: HttpServer

interface Input {
  id: string
  value: string
}

const inputSchema = Joi.object({
  id: Joi.string().uuid().required(),
  value: Joi.string().required()
})

const TEST_INPUT = {
  id: uuidv4(),
  value: 'test value'
}

const SIMPLE_TEST_RESPONSE = 'test response'
const INPUT_TEST_RESPONSE = 'input test response'

let invoked: boolean

describe('HttpServer', () => {
  beforeEach(() => {
    invoked = false
    app = makeExpress()
    logger = mock<Logger>()
    server = new HttpServer(app, logger)
  })

  const simpleCallback = (
    input: undefined,
    request: Request,
    context: Context
  ): string => {
    expect(request).not.toBeNull()
    expect(context).not.toBeNull()
    invoked = true
    return SIMPLE_TEST_RESPONSE
  }

  const callbackWithInput = (
    input: Input,
    request: Request,
    context: Context
  ): string => {
    expect(input).toEqual(TEST_INPUT)
    expect(request).not.toBeNull()
    expect(context).not.toBeNull()
    invoked = true
    return INPUT_TEST_RESPONSE
  }

  describe('register', () => {
    test('should add a callback invoked by the framework', async () => {
      server.register<undefined, string>({ callback: simpleCallback })
      await testRequest(app)
        .get('/')
        .send()
        .expect(StatusCodes.OK)
        .expect('Content-Type', 'text/html; charset=utf-8')
        .expect(SIMPLE_TEST_RESPONSE)
      expect(invoked).toBe(true)
    })

    test.each(Object.values(HttpMethod))(
      'should support registering a %s handler',
      async (method) => {
        server.register({ method, path: '/', callback: simpleCallback })
        await (testRequest(app) as any)[method.toLowerCase()]('/').send()
        expect(invoked).toBe(true)
      }
    )

    test('should support registration of multiple handlers', async () => {
      server.register<undefined, string>({
        path: '/simple',
        callback: simpleCallback
      })
      server.register<Input, string>({
        path: '/input',
        callback: callbackWithInput
      })
      await testRequest(app).get('/simple').send().expect(SIMPLE_TEST_RESPONSE)
      await testRequest(app)
        .get('/input')
        .send(TEST_INPUT)
        .expect(INPUT_TEST_RESPONSE)
      expect(invoked).toBe(true)
    })

    test('should successfully validate valid input from the request to the handler when provided with a schema', async () => {
      server.register<Input, string>({
        schema: inputSchema,
        callback: callbackWithInput
      })
      await testRequest(app)
        .get('/')
        .send(TEST_INPUT)
        .expect(StatusCodes.OK)
        .expect(INPUT_TEST_RESPONSE)
      expect(invoked).toBe(true)
    })

    test('should return a BAD_REQUEST status when input is invalid according to the schema', async () => {
      server.register<Input, string>({
        schema: inputSchema,
        callback: callbackWithInput
      })
      await testRequest(app)
        .get('/')
        .send({ ...TEST_INPUT, id: 'not a uuid' })
        .expect(StatusCodes.BAD_REQUEST)
    })

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

    test.todo('should strip any data from an INTERNAL_SERVER_ERROR')
  })

  test('exposes a health endpoint', async () => {
    await testRequest(app).get('/healthz').send().expect(StatusCodes.OK)
  })
})
