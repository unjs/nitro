import { CompatibilityEvent, eventHandler } from 'h3'

export interface RenderResponse {
  body: string,
  statusCode: number,
  statusMessage: string,
  headers: Record<string, string>
}

export type RenderHandler = (event: CompatibilityEvent) => Partial<RenderResponse> | Promise<Partial<RenderResponse>>

export function defineRenderHandler (handler: RenderHandler) {
  return eventHandler(async (event) => {
    // TODO: Use serve-placeholder
    if (event.req.url.endsWith('/favicon.ico')) {
      event.res.setHeader('Content-Type', 'image/x-icon')
      event.res.end('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      return
    }

    const response = await handler(event)

    // TODO: Warn if response is already handled

    // TODO: Caching support

    // Sent headers
    if (!event.res.headersSent && response.headers) {
      for (const header in response.headers) {
        event.res.setHeader(header, response.headers[header])
      }
      if (response.statusCode) {
        event.res.statusCode = response.statusCode
      }
      if (response.statusMessage) {
        event.res.statusMessage = response.statusMessage
      }
    }

    // Send response body
    if (!event.res.writableEnded) {
      // TODO: Warn if body is not string
      event.res.end(typeof response.body === 'string' ? response.body : JSON.stringify(response.body))
    }
  })
}
