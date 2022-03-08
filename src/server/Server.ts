import { Application, Request, Response } from 'express'
import { Server as HttpServer } from 'http'
import { Logger } from 'winston'

import { ExpressContext } from './ExpressContext'

export interface Context {
  traceId?: string
}

export interface Handler {
  method?: string
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
    this.app.all(handler.path ? handler.path : '/', expressCallback)
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
