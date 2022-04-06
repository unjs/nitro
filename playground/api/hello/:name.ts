import { defineEventHandler } from 'h3'

export default defineEventHandler(event => `Hello ${event.params.name}!`)
