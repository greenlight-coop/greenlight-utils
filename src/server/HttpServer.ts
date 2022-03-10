import { Application, Request, Response } from 'express'
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

export interface HttpHandler {
  method?: HttpMethod
  path?: string
  callback: (request: Request, context: Context) => void | string | object
}

type ServerError = Error & { status?: number }

function makeExpressCallback(handler: HttpHandler, logger: Logger) {
  function expressCallback(request: Request, response: Response): void {
    try {
      logger.debug('In callback')
      const context = new ServerContext(logger)
      const returnBody = handler.callback(request, context)
      if (returnBody) {
        logger.debug('callback returned', { returnBody })
        response.send(returnBody)
      } else {
        logger.debug('callback return is void')
        response.end()
      }
    } catch (error) {
      const serverError = error as ServerError
      if (!serverError.status || serverError.status >= 500) {
        logger.error('Error during callback', error)
      }
      throw error
    }
  }
  return expressCallback
}

export class HttpServer extends AbstractServer {
  constructor(app: Application, logger: Logger) {
    super(app, logger)
  }

  public register(handler: HttpHandler): void {
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
  }
}
