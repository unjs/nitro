import { defineEventHandler } from 'h3'

const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Cache is handled with route options in nitro.config
export default defineEventHandler(async () => {
  await waitFor(1000)
  return `Response generated at ${new Date().toISOString()} (took 1 second)`
})
