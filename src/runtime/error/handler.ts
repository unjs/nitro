import type { CompatibilityEvent } from 'h3'
import type { ErrorPayload } from '../../types'

export default function renderError (payload: ErrorPayload, event: CompatibilityEvent) {
  event.res.statusCode = payload.error.statusCode || 500
  event.res.statusMessage = payload.error.statusMessage || 'Internal Server Error'

  // Console output
  if (payload.error.statusCode !== 404) {
    console.error(payload.error.message + '\n' + payload.stack.map(l => '  ' + l.text).join('  \n'))
  }

  event.res.setHeader('Content-Type', 'application/json')
  return event.res.end(JSON.stringify(payload.errorObject))
}
