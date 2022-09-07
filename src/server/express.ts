/* istanbul ignore file */

import bodyParser from 'body-parser'
import express, { Application } from 'express'
import helmet from 'helmet'

export function makeExpress(): Application {
  return express()
    .use(
      bodyParser.urlencoded({
        extended: true
      })
    )
    .use(express.json())
    .use(helmet.hidePoweredBy())
}
