import { Request } from 'express'
import { mock } from 'jest-mock-extended'
import Joi from 'joi'
import { v4 as uuidv4 } from 'uuid'

import { getBody } from './utils'

describe('utils', () => {
  describe('getBody', () => {
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

    const request = mock<Request>()

    beforeEach(() => {
      request.body = TEST_INPUT
    })

    test('should return valid input', () => {
      const value: Input = getBody<Input>(request, inputSchema)
      expect(value).toMatchObject(TEST_INPUT)
    })

    test('should return valid input', () => {
      request.body = { value: 'test value' }
      expect(() => getBody<Input>(request, inputSchema)).toThrow()
    })
  })
})
