import { ContainerModule, interfaces } from 'inversify'
import { createLogger, format, Logger, transports } from 'winston'

const { combine, timestamp, json } = format

const logger: Logger = createLogger({
  level:
    (process.env?.DEBUG ?? 'false').toLowerCase() === 'true' ? 'debug' : 'info',
  format: combine(timestamp(), json()),
  transports: [new transports.Console()]
})

export const loggerModule = new ContainerModule((bind: interfaces.Bind) => {
  bind<Logger>('Logger').toConstantValue(logger)
})
