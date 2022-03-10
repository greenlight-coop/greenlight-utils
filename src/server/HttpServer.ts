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
  callback: (request: Request, response: Response) => void
}

export class HttpServer extends AbstractServer {
  constructor(app: Application, logger: Logger) {
    super(app, logger)
  }

  public register(handler: HttpHandler): void {
    this.logger.debug('Registering', { handler })
    const path = handler.path ? handler.path : '/'
    switch (handler.method) {
      case undefined:
        this.app.all(path, handler.callback)
        break
      case HttpMethod.DELETE:
        this.app.delete(path, handler.callback)
        break
      case HttpMethod.GET:
        this.app.get(path, handler.callback)
        break
      case HttpMethod.POST:
        this.app.post(path, handler.callback)
        break
      case HttpMethod.PUT:
        this.app.put(path, handler.callback)
        break
      default:
        throw new Error(`Method ${handler.method} not supported`)
    }
  }
}
