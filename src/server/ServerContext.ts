import { Request } from 'express'
import { Logger } from 'winston'

import { Context } from './AbstractServer'

export class ServerContext implements Context {
  constructor(public request: Request, public logger: Logger) {}
}
