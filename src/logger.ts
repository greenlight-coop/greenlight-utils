import { createLogger, format, transports } from 'winston'

const { combine, timestamp, simple } = format

export default createLogger({
  level: 'info',
  format: combine(timestamp(), simple()),
  transports: [new transports.Console()]
})
