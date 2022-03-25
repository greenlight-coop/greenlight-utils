import { Application, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'
import { Logger } from 'winston'

import { AbstractServer, Context } from './AbstractServer'
import { ServerContext } from './ServerContext'

export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

export interface HttpRequest<T> {
  method?: HttpMethod
  path?: string
  body: T
}

export interface HttpHandler<I, O> {
  method?: HttpMethod
  path?: string
  schema?: Joi.Schema<I>
  callback: (input: I, request: Request, context: Context) => O
}

type ServerError = Error & { status?: number }
function makeExpressCallback<I, O>(handler: HttpHandler<I, O>, logger: Logger) {
  function validate(request: Request, schema: Joi.Schema<I>) {
    logger.debug('Validating...')
    try {
      Joi.assert(request.body, schema, {
        abortEarly: false,
        errors: { stack: false }
      })
    } catch (error) {
      const serverError = error as ServerError
      serverError.status = StatusCodes.BAD_REQUEST
      throw serverError
    }
  }

  function expressCallback(request: Request, response: Response): void {
    logger.debug('In callback')
    const context = new ServerContext(logger)
    if (handler.schema) {
      validate(request, handler.schema)
    }
    const input = request.body as I
    const returnBody = handler.callback(input, request, context)
    if (returnBody) {
      logger.debug('callback returned', { returnBody })
      response.send(returnBody)
    } else {
      logger.debug('callback return is void')
      response.end()
    }
  }
  return expressCallback
}

function makeErrorHandler(logger: Logger) {
  return function errorHandler(
    error: Error,
    request: Request,
    response: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: (argument0: Error) => void
  ): void {
    const serverError = error as ServerError
    if (serverError.status === StatusCodes.BAD_REQUEST) {
      response.status(StatusCodes.BAD_REQUEST)
      response.send(serverError.toString())
    } else {
      logger.error('error in callback:', serverError)
      response.status(StatusCodes.INTERNAL_SERVER_ERROR)
      response.send('Internal Server Error')
    }
  }
}

export class HttpServer extends AbstractServer {
  constructor(app: Application, logger: Logger) {
    super(app, logger)
  }

  public register<I, O>(handler: HttpHandler<I, O>): void {
    this.logger.debug('Registering', { handler })
    const expressCallback = makeExpressCallback(handler, this.logger)

    const path = handler.path ? handler.path : '/'
    switch (handler.method) {
      case undefined:
        this.app.all(path, expressCallback)
        break
      case HttpMethod.DELETE:
        this.app.delete(path, expressCallback)
        break
      case HttpMethod.GET:
        this.app.get(path, expressCallback)
        break
      case HttpMethod.POST:
        this.app.post(path, expressCallback)
        break
      case HttpMethod.PUT:
        this.app.put(path, expressCallback)
        break
      default:
        throw new Error(`Method ${handler.method} not supported`)
    }
    this.app.use(makeErrorHandler(this.logger))
  }
}
