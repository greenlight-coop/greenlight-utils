import { Application } from 'express'
import { Logger } from 'winston'

export function listen(app: Application, logger: Logger): void {
  const server = app.listen(8080)

  function close(signal: number) {
    logger.info({ message: `Received signal to terminate: ${signal}` })
    server.close(() => logger.info({ message: 'Express server closed' }))
    process.exit()
  }

  process.on('SIGINT', close)
  process.on('SIGTERM', close)
}
