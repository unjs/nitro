import { defineEventHandler } from 'h3'

export default defineEventHandler(event => `Hello ${event.context.params.name}!`)
