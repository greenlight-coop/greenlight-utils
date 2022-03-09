import { createLogger, format, Logger, transports } from 'winston'

const { combine, timestamp, json } = format

export function getLogger(): Logger {
  return createLogger({
    level:
      (process.env?.DEBUG ?? 'false').toLowerCase() === 'true'
        ? 'debug'
        : 'info',
    format: combine(timestamp(), json()),
    transports: [new transports.Console()]
  })
}
