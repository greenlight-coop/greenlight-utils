import express, { Application } from 'express'
import actuator from 'express-actuator'
import helmet from 'helmet'

export function makeExpress(): Application {
  return express()
    .use(express.json())
    .use(helmet.hidePoweredBy())
    .use(actuator())
}
