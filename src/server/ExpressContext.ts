import { Request } from 'express'

export class ExpressContext {
  public method

  public path

  public traceId?

  constructor(request: Request) {
    this.method = request.method
    this.path = request.path
    this.traceId = request.get('x-request-id')
  }
}
