// import ansiHTML from 'ansi-html'
import type { CompatibilityEvent } from 'h3'
const cwd = process.cwd()

// const hasReqHeader = (req, header, includes) => req.headers[header] && req.headers[header].toLowerCase().includes(includes)

const isDev = process.env.NODE_ENV === 'development'

export function handleError (error, event: CompatibilityEvent) {
  // const isJsonRequest = hasReqHeader(req, 'accept', 'application/json') || hasReqHeader(req, 'user-agent', 'curl/') || hasReqHeader(req, 'user-agent', 'httpie/')

  const stack = (error.stack || '')
    .split('\n')
    .splice(1)
    .filter(line => line.includes('at '))
    .map((line) => {
      const text = line
        .replace(cwd + '/', './')
        .replace('webpack:/', '')
        .replace('.vue', '.js') // TODO: Support sourcemap
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
    statusCode: error.statusCode || 500,
    statusMessage: is404 ? 'Page Not Found' : 'Internal Server Error',
    description: isDev && !is404
      ? `
    <h1>${error.message}</h1>
    <pre>${stack.map(i => `<span class="stack${i.internal ? ' internal' : ''}">${i.text}</span>`).join('\n')}</pre>
    `
      : ''
  }

  event.res.statusCode = error.statusCode || 500
  event.res.statusMessage = error.statusMessage || 'Internal Server Error'

  // Console output
  if (!is404) {
    console.error(error.message + '\n' + stack.map(l => '  ' + l.text).join('  \n'))
  }

  // JSON response
  // if (isJsonRequest) {
  event.res.setHeader('Content-Type', 'application/json')
  return event.res.end(JSON.stringify(errorObject))
  // }

  // HTML response
  // const errorTemplate = is404 ? error404 : (isDev ? errorDev : error500)
  // const html = errorTemplate(errorObject)
  // res.setHeader('Content-Type', 'text/html;charset=UTF-8')
  // res.end(html)
}
