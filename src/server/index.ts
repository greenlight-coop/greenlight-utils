import { logger } from '..'
import { makeExpress } from './express'
import { Server } from './Server'

export function makeServer(): Server {
  return new Server(makeExpress(), logger)
}
