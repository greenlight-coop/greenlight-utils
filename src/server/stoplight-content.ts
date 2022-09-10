/* eslint-disable quotes */
import { NextFunction, Request, Response } from 'express'
import { cloneDeep } from 'lodash'

import { getEnvironmentVariable } from '../utils'

const serviceDomain = getEnvironmentVariable('SERVICE_DOMAIN')
const servicePath = getEnvironmentVariable('SERVICE_PATH')

export function makeGetStoplightContent(
  openApiSpec: Record<string, unknown>
): (request: Request, response: Response, next: NextFunction) => void {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updatedSpec: any = cloneDeep(openApiSpec)
  if (serviceDomain && servicePath) {
    updatedSpec.servers[0].url = `https://${serviceDomain}${servicePath}`
  }
  const stringifiedSpec = JSON.stringify(updatedSpec).replaceAll("'", '&#39;')

  return function getStoplightContent(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    const content = `<!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
          <title>Elements in HTML</title>
        
          <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
          <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
        </head>
        <body>

          <elements-api
            apiDescriptionDocument='${stringifiedSpec}'
            basePath=".."
            router="hash"
          />

        </body>
      </html>`

    response.send(content)
    next()
  }
}
