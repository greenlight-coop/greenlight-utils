import { createLogger, format, transports } from 'winston'

const { combine, timestamp, simple } = format

export const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), simple()),
  transports: [new transports.Console()]
})
