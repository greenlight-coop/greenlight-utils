import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

import { SchemaValidationError } from './schema-validation-error'
import { validate } from './validate'

describe('utils', () => {
  describe('validate', () => {
    interface Input {
      id: string
      value: string
    }

    const inputSchema = Joi.object({
      id: Joi.string().uuid().required(),
      value: Joi.string().required()
    })

    const TEST_INPUT = {
      id: uuidv4(),
      value: 'test value'
    }

    test('should succeed for valid input', () => {
      validate<Input>(TEST_INPUT, inputSchema)
    })

    test('should throw on invalid input', () => {
      const invalid = { ...TEST_INPUT, id: 'not a uuuid' }
      expect(() => validate<Input>(invalid, inputSchema)).toThrow(
        SchemaValidationError
      )
    })
  })
})
