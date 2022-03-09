import { Application } from 'express'
import { Server as HttpServer } from 'http'
import { Logger } from 'winston'

export abstract class AbstractServer {
  private expressServer?: HttpServer

  constructor(protected app: Application, protected logger: Logger) {}

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
