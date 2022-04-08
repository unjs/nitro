import { defineEventHandler } from 'h3'

export default defineEventHandler((event) => {
  event.context.auth = { name: 'User ' + Math.round(Math.random() * 100) }
})
