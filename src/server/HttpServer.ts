import { Application, Request, Response } from 'express'
import { Logger } from 'winston'

import { AbstractServer } from './AbstractServer'

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
  callback: (request: Request) => void | string | object
}

export class HttpServer extends AbstractServer {
  constructor(app: Application, logger: Logger) {
    super(app, logger)
  }

  public register(handler: HttpHandler): void {
    this.logger.debug('Registering', { handler })
    const expressCallback = (request: Request, response: Response): void => {
      try {
        const returnBody = handler.callback(request)
        this.logger.debug({ returnBody })
        response.send(returnBody)
      } catch (error) {
        this.logger.error(error)
        throw error
      }
    }

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
