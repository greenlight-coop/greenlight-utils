import { Request } from 'express'
import { StatusCodes } from 'http-status-codes'
import Joi from 'joi'

type ServerError = Error & { status?: number }

export function getBody<T>(request: Request, schema: Joi.ObjectSchema<T>): T {
  try {
    Joi.assert(request.body, schema, {
      abortEarly: false,
      errors: { stack: false }
    })
    return request.body as T
  } catch (error) {
    const serverError = error as ServerError
    serverError.status = StatusCodes.BAD_REQUEST
    throw serverError
  }
}
