import Joi from 'joi'
import { Controller } from 'tsoa'
import { Logger } from 'winston'

import { validate } from '../validation'

export abstract class BaseController extends Controller {
  protected constructor(protected logger: Logger) {
    super()
  }

  protected validate<T>(value: T, schema: Joi.AnySchema<T>) {
    validate(value, schema)
  }
}
