/* istanbul ignore file */

import { Application, NextFunction, Request, Response } from 'express'
import * as express from 'express'
import { Server as ExpressServer } from 'http'
import { StatusCodes } from 'http-status-codes'
import { Container, decorate, injectable } from 'inversify'
import { buildProviderModule } from 'inversify-binding-decorators'
import { pick } from 'lodash'
import { Controller, ValidateError } from 'tsoa'
import { Logger } from 'winston'

import { loggerModule } from '../logger'
import { SchemaValidationError } from '../validation'
import { makeExpress } from './express'

const SERVICE_HTTP_PORT = 8080

function makeDebugLogging(logger: Logger) {
  function debugLogging(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    logger.debug('Request', {
      request: pick(request, ['method', 'url', 'headers', 'body'])
    })
    next()
  }
  return debugLogging
}

function makeErrorHandler(logger: Logger) {
  function errorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    if (error instanceof SchemaValidationError) {
      return response.status(StatusCodes.BAD_REQUEST).json(error.message)
    }
    if (error instanceof ValidateError) {
      return response.status(StatusCodes.BAD_REQUEST).json({
        message: 'Validation Failed',
        details: error.fields
      })
    }
    if (error) {
      logger.error('Unexpected error', error)
      throw error
    }
    return next()
  }
  return errorHandler
}

function makeGetOpenApi(openApiSpec: Record<string, unknown>) {
  function getOpenApi(
    request: Request,
    response: Response,
    next: NextFunction
  ) {
    response.send(openApiSpec)
    next()
  }
  return getOpenApi
}

function makeClose(logger: Logger, expressServer: ExpressServer) {
  function close(signal: number) {
    logger.info({ message: `Received signal to terminate: ${signal}` })
    expressServer.close(() => logger.info({ message: 'Express server closed' }))
    process.exit()
  }
  return close
}

export type RegisterRoutesFunction = (app: express.Router) => void

export interface HttpServerConfig {
  registerRoutes?: RegisterRoutesFunction
  container: Container
  openApiSpec: Record<string, unknown>
}

export class HttpServer {
  private expressServer?: ExpressServer

  private logger: Logger

  private app: Application

  public constructor(config: HttpServerConfig) {
    this.app = makeExpress()

    config.container.load(loggerModule, buildProviderModule())
    decorate(injectable(), Controller)

    this.logger = config.container.get('Logger')
    this.app.use(makeDebugLogging(this.logger))
    this.app.route('/healthz').get((request, response) => response.send('UP'))
    if (config.registerRoutes) {
      this.app.route('/openapi').get(makeGetOpenApi(config.openApiSpec))
      this.app.use('/docs', express.static('static/openapi'))
      config.registerRoutes(this.app)
      this.app.use(makeErrorHandler(this.logger))
    }
  }

  public start(): void {
    this.logger.info('Starting server')
    this.expressServer = this.app.listen(SERVICE_HTTP_PORT)
    const close = makeClose(this.logger, this.expressServer)
    process.on('SIGINT', close)
    process.on('SIGTERM', close)
  }
}
