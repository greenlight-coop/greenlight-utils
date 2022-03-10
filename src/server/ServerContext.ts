import { Logger } from 'winston'

import { Context } from './AbstractServer'

export class ServerContext implements Context {
  constructor(public logger: Logger) {}
}
