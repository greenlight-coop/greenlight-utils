import { CloudEventV1, HTTP } from 'cloudevents'
import { Application, Request, Response } from 'express'
import { Logger } from 'winston'

import { AbstractServer } from './AbstractServer'

export type cloudEventCallback<T> = (event: CloudEventV1<T>) => void

export class EventServer<T> extends AbstractServer {
  constructor(
    callback: cloudEventCallback<T>,
    app: Application,
    logger: Logger
  ) {
    super(app, logger)
    this.register(callback)
  }

  private makeExpressCallback(callback: cloudEventCallback<T>) {
    return async (request: Request, response: Response): Promise<void> => {
      try {
        const event = HTTP.toEvent<T>(request)
        this.logger.debug('Handling event', { event })
        if (Array.isArray(event)) {
          throw new TypeError('CloudEvent arrays unsupported')
        }
        await callback(event)
        response.send()
        this.logger.debug('Completed event handling', { event })
      } catch (error) {
        this.logger.error('Event handling failed', error)
        throw error
      }
    }
  }

  private register(callback: cloudEventCallback<T>): void {
    this.logger.debug('Registering CloudEvent callback')
    const expressCallback = this.makeExpressCallback(callback)
    this.app.post('/', expressCallback)
  }
}
