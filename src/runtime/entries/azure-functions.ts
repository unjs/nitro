import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'

const higherOrderLog = (name, context) => {
  const logFn = (...params) => {
    if (context.log[name]) {
      context.log[name](...params)
    } else {
      context.log.info(...params)
    }
  }

  console[name] = logFn
}
/**
 * intercepts all calls to console.* and redirects them to the azure context logger
 * Do not intercept twice
 */
const interceptLoggingFactory = () => {
  let intercepted = false
  const levels = ['log', 'info', 'warn', 'error']

  return (context) => {
    if (intercepted) { return }
    levels.forEach(m => higherOrderLog(m, context))
    intercepted = true
  }
}
const interceptLogging = interceptLoggingFactory()

export async function handle (context, req) {
  const url = '/' + (req.params.url || '')
  interceptLogging(context)
  const { body, status, statusText, headers } = await nitroApp.localCall({
    url,
    headers: req.headers,
    method: req.method,
    body: req.body
  })

  context.res = {
    status,
    headers,
    body: body ? body.toString() : statusText
  }
}
