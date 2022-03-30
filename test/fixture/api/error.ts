import { createError } from 'h3'
export default () => {
  throw createError({
    statusCode: 503,
    statusMessage: 'Service Unavailable'
  })
}
