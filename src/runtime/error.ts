// import ansiHTML from 'ansi-html'
import type { CompatibilityEvent } from 'h3'
import { normalizeError } from './utils'

const isDev = process.env.NODE_ENV === 'development'

export default function handleError (error: any, event: CompatibilityEvent) {
  const { stack, statusCode, statusMessage, message } = normalizeError(error)

  const errorObject = {
    url: event.req.url,
    statusCode,
    statusMessage,
    message,
    description: isDev && statusCode !== 404
      ? `<pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>`
      : ''
  }

  // Console output
  if (statusCode !== 404) {
    console.error(error.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))
  }

  event.res.statusCode = statusCode
  event.res.statusMessage = statusMessage
  event.res.setHeader('Content-Type', 'application/json')
  event.res.end(JSON.stringify(errorObject))
}
