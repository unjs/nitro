import '#internal/nitro/virtual/polyfill'
import { nitroApp } from '../app'

const levels = ['log', 'info', 'warn', 'error']

const higherOrderLog = (name: string, context) => {
  const logFn = (params) => {
    if (context[name]) {
      context[name](...params)
    } else if (context.log[name]) {
      context.log[name](...params)
    }
  }

  console[name] = logFn
}
/**
 * intercepts all calls to console.* and redirects them to the azure context logger
 */
const interceptLogging = context =>
  levels.forEach(m => higherOrderLog(m, context))

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
