// import ansiHTML from 'ansi-html'
import type { CompatibilityEvent } from 'h3'
import type { ErrorPayload } from '../../types'
import renderError from '#nitro-error'
const cwd = process.cwd()

const hasReqHeader = (req, header, includes) => req.headers[header] && req.headers[header].toLowerCase().includes(includes)

const isDev = process.env.NODE_ENV === 'development'

export function handleError (error: any, event: CompatibilityEvent) {
  const isJsonRequest = hasReqHeader(event.req, 'accept', 'application/json') || hasReqHeader(event.req, 'user-agent', 'curl/') || hasReqHeader(event.req, 'user-agent', 'httpie/')

  const stack = (error.stack || '')
    .split('\n')
    .splice(1)
    .filter(line => line.includes('at '))
    .map((line) => {
      const text = line
        .replace(cwd + '/', './')
        .replace('webpack:/', '')
        .trim()
      return {
        text,
        internal: (line.includes('node_modules') && !line.includes('.cache')) ||
          line.includes('internal') ||
          line.includes('new Promise')
      }
    })

  const is404 = error.statusCode === 404

  const errorObject = {
    url: event.req.url,
    statusCode: error.statusCode || 500,
    statusMessage: error.statusMessage ?? is404 ? 'Page Not Found' : 'Internal Server Error',
    message: error.message || error.toString(),
    description: isDev && !is404
      ? `<pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>`
      : ''
  }

  const payload: ErrorPayload = { error, errorObject, stack, isJsonRequest }
  return renderError(payload, event)
}
