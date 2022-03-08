import { createLogger, format, transports } from 'winston'

const { combine, timestamp, json } = format

export const logger = createLogger({
  level: 'info',
  format: combine(timestamp(), json()),
  transports: [new transports.Console()]
})
