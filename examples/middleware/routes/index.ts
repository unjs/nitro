import { defineEventHandler } from 'h3'

export default defineEventHandler(event => ({
  auth: event.context.auth
}))
