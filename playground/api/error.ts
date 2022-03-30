import { defineEventHandler } from 'h3'

export default defineEventHandler((_event) => {
  throw new Error('Booo')
})
