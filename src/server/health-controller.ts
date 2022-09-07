/* istanbul ignore file */

import { Controller, Get, Hidden, Route } from 'tsoa'

import { provideSingleton } from '../inject/provideSingleton'

@Hidden()
@Route('healthz')
@provideSingleton(HealthController)
export class HealthController extends Controller {
  @Get()
  public get(): string {
    return 'UP'
  }
}
