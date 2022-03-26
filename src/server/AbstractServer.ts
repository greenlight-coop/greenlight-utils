import { Application, NextFunction, Request, Response } from 'express'
import { Server as HttpServer } from 'http'
import { pick } from 'lodash'
import { Logger } from 'winston'

export interface Context {
  request: Request
  logger: Logger
}

function makeDebugLogging(logger: Logger) {
  function debugLogging(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    logger.debug('Request', {
      request: pick(request, ['method', 'url', 'headers', 'body'])
    })
    next()
  }
  return debugLogging
}

export abstract class AbstractServer {
  private expressServer?: HttpServer

  constructor(protected app: Application, protected logger: Logger) {
    this.app.use(makeDebugLogging(this.logger))
    this.app.get('/healthz', (request, response) =>
      response.send({
        status: 'UP'
      })
    )
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
