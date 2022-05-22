import {
  BaseHttpController,
  controller,
  httpGet
} from 'inversify-express-utils'

@controller('/healthz')
export class HealthController extends BaseHttpController {
  @httpGet('/')
  public get(): string {
    return 'UP'
  }
}
