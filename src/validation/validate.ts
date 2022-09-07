import Joi from 'joi'

import { SchemaValidationError } from './schema-validation-error'

export function validate<T>(value: T, schema: Joi.AnySchema<T>): void {
  const options = {
    abortEarly: false,
    errors: { stack: false }
  }
  const result = schema.validate(value, options)
  if (result.error) {
    throw new SchemaValidationError(result)
  }
}
