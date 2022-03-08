import { Application, Request, Response } from 'express'
import { Server as HttpServer } from 'http'
import { Logger } from 'winston'

import { ExpressContext } from './ExpressContext'

enum HttpMethod {
  GET,
  POST,
  PUT,
  DELETE
}

export interface Context {
  traceId?: string
}

export interface Handler {
  method?: HttpMethod
  path?: string
  callback: (body: object, context: Context) => void | string | object
}

export class Server {
  private expressServer?: HttpServer

  constructor(private app: Application, private logger: Logger) {}

  public register(handler: Handler): void {
    const expressCallback = (request: Request, response: Response): void => {
      const context = new ExpressContext(request)
      response.send(handler.callback(request.body, context))
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

  private close(signal: number) {
    this.logger.info({ message: `Received signal to terminate: ${signal}` })
    this.expressServer?.close(() =>
      this.logger.info({ message: 'Express server closed' })
    )
    process.exit()
  }

  public start(): void {
    this.logger.info('Starting server')
    this.expressServer = this.app.listen(8080)
    process.on('SIGINT', this.close)
    process.on('SIGTERM', this.close)
  }
}
