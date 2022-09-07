import { ValidationResult } from 'joi'

export class SchemaValidationError extends Error {
  constructor(result: ValidationResult) {
    const errorMessages = result.error?.details.map((detail) => detail.message)
    super(JSON.stringify(errorMessages, undefined, 2))
  }
}
