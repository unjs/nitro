import { createError } from 'h3'
export default eventHandler(() => {
  throw createError({
    statusCode: 503,
    statusMessage: 'Service Unavailable'
  })
})
