import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  console.log('Middleware:', event.req.url)
})
