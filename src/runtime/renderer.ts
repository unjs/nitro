import { H3Event, eventHandler } from 'h3'
import { useNitroApp } from './app'

export interface RenderResponse {
  body: string,
  statusCode: number,
  statusMessage: string,
  headers: Record<string, string>
}

export type RenderHandler = (event: H3Event) => Partial<RenderResponse> | Promise<Partial<RenderResponse>>

export function defineRenderHandler (handler: RenderHandler) {
  return eventHandler(async (event) => {
    // TODO: Use serve-placeholder
    if (event.req.url.endsWith('/favicon.ico')) {
      event.res.setHeader('Content-Type', 'image/x-icon')
      event.res.end('data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7')
      return
    }

    const response = await handler(event)
    if (!response) {
      if (!event.res.writableEnded) {
        event.res.statusCode = event.res.statusCode === 200 ? 500 : event.res.statusCode
        event.res.end('No response returned from render handler: ' + event.req.url)
      }
      return
    }

    // Allow hooking and modifying response
    const nitroApp = useNitroApp()
    await nitroApp.hooks.callHook('render:response', response, { event })

    // TODO: Warn if response is already handled

    // TODO: Caching support

    // Send headers
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
