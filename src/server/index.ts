import { getLogger } from '../logger'
import { cloudEventCallback, EventServer } from './EventServer'
import { makeExpress } from './express'
import { HttpServer } from './HttpServer'

export { Context } from './AbstractServer'
export { cloudEventCallback } from './EventServer'
export { HttpHandler, HttpMethod } from './HttpServer'

export function makeEventServer<T>(
  callback: cloudEventCallback<T>
): EventServer<T> {
  return new EventServer(callback, makeExpress(), getLogger())
}

export function makeHttpServer(): HttpServer {
  return new HttpServer(makeExpress(), getLogger())
}
