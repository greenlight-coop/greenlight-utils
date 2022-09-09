import { NextFunction, Request, Response } from 'express'

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
      apiDescriptionUrl="./../openapi"
      router="hash"
    />

  </body>
</html>`

export function getStoplightContent(
  request: Request,
  response: Response,
  next: NextFunction
): void {
  response.send(content)
  next()
}
