// import { cachedEventHandler } from '#nitro'

const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Cache is handled with route options in nitro.config
export default async () => {
  await waitFor(1000)
  return `Response generated at ${new Date().toISOString()} (took 1 second)`
}
