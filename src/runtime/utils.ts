import type { CompatibilityEvent } from 'h3'

const METHOD_WITH_BODY_RE = /post|put|patch/i
const TEXT_MIME_RE = /application\/text|text\/html/
const JSON_MIME_RE = /application\/json/

export function requestHasBody (request: globalThis.Request) : boolean {
  return METHOD_WITH_BODY_RE.test(request.method)
}

export async function useRequestBody (request: globalThis.Request): Promise<any> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('form')) {
    const formData = await request.formData()
    const body = Object.create(null)
    for (const entry of formData.entries()) {
      body[entry[0]] = entry[1]
    }
    return body
  } else if (JSON_MIME_RE.test(contentType)) {
    return request.json()
  } else if (TEXT_MIME_RE.test(contentType)) {
    return request.text()
  } else {
    const blob = await request.blob()
    return URL.createObjectURL(blob)
  }
}

const hasReqHeader = (req, header, includes) => req.headers[header] && req.headers[header].toLowerCase().includes(includes)

export const isJsonRequest = (event: CompatibilityEvent) => hasReqHeader(event.req, 'accept', 'application/json') || hasReqHeader(event.req, 'user-agent', 'curl/') || hasReqHeader(event.req, 'user-agent', 'httpie/')

export const normalizeError = (error: any) => {
  const cwd = process.cwd()
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

  const statusCode = error.statusCode || 500
  const statusMessage = error.statusMessage ?? statusCode === 404 ? 'Page Not Found' : 'Internal Server Error'
  const message = error.message || error.toString()

  return {
    stack,
    statusCode,
    statusMessage,
    message
  }
}
