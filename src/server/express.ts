import express, { Application } from 'express'
import helmet from 'helmet'

export function makeExpress(): Application {
  return express().use(express.json()).use(helmet.hidePoweredBy())
}
