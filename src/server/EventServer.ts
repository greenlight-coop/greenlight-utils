import { CloudEventV1, HTTP } from 'cloudevents'
import { Application, Request, Response } from 'express'
import { Logger } from 'winston'

import { AbstractServer, Context } from './AbstractServer'
import { ServerContext } from './ServerContext'

export type cloudEventCallback<T> = (
  event: CloudEventV1<T>,
  context: Context
) => void

export class EventServer<T> extends AbstractServer {
  constructor(
    callback: cloudEventCallback<T>,
    app: Application,
    logger: Logger
  ) {
    super(app, logger)
    this.register(callback)
  }

  private makeExpressCallback(callback: cloudEventCallback<T>, logger: Logger) {
    return async (request: Request, response: Response): Promise<void> => {
      try {
        const event = HTTP.toEvent<T>(request)
        const context = new ServerContext(request, logger)
        this.logger.debug('Handling event', { event })
        if (Array.isArray(event)) {
          throw new TypeError('CloudEvent arrays unsupported')
        }
        await callback(event, context)
        response.end()
        this.logger.debug('Completed event handling', { event })
      } catch (error) {
        this.logger.error('Event handling failed', error)
        throw error
      }
    }
  }

  private register(callback: cloudEventCallback<T>): void {
    this.logger.debug('Registering CloudEvent callback')
    const expressCallback = this.makeExpressCallback(callback, this.logger)
    this.app.post('/', expressCallback)
  }
}
