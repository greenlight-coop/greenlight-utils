import { NextFunction, Request, Response } from 'express'
import { Logger } from 'winston'

export function makeGetStoplightContent(
  openApiSpec: Record<string, unknown>,
  logger: Logger
): (request: Request, response: Response, next: NextFunction) => void {
  return function getStoplightContent(
    request: Request,
    response: Response,
    next: NextFunction
  ): void {
    logger.debug('Headers', { headers: request.headers })

    const { referer } = request.headers
    const basePath = referer
      ? referer.slice(0, Math.max(0, referer.lastIndexOf('/docs')))
      : '.'

    logger.debug(`basePath: ${basePath}`)

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
            apiDescriptionDocument="${openApiSpec}"
            basePath="${basePath}"
            router="hash"
          />

        </body>
      </html>`

    response.send(content)
    next()
  }
}
