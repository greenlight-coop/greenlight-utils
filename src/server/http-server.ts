import './health-controller'

import { Application, NextFunction, Request, Response } from 'express'
import { Server as ExpressServer } from 'http'
import { Container, interfaces } from 'inversify'
import { InversifyExpressServer } from 'inversify-express-utils'
import { pick } from 'lodash'
import { Logger } from 'winston'

import { loggerModule } from '../logger'
import { makeExpress } from './express'

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

function makeClose(logger: Logger, expressServer: ExpressServer) {
  function close(signal: number) {
    logger.info({ message: `Received signal to terminate: ${signal}` })
    expressServer.close(() => logger.info({ message: 'Express server closed' }))
    process.exit()
  }
  return close
}

export class HttpServer {
  private expressServer?: ExpressServer

  private logger: Logger

  private app: Application

  public constructor(...modules: interfaces.ContainerModule[]) {
    const baseApp = makeExpress()
    const container = new Container()
    container.load(loggerModule, ...modules)
    this.logger = container.get('Logger')
    baseApp.use(makeDebugLogging(this.logger))
    const inversifyExpressServer = new InversifyExpressServer(
      container,
      undefined,
      undefined,
      baseApp
    )
    this.app = inversifyExpressServer.build()
  }

  public start(): void {
    this.logger.info('Starting server')
    this.expressServer = this.app.listen(8080)
    const close = makeClose(this.logger, this.expressServer)
    process.on('SIGINT', close)
    process.on('SIGTERM', close)
  }
}
