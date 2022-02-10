import { resolve } from 'pathe'
import { describe } from 'vitest'
import { setupTest, startServer, testNitro } from '../utils'

describe('nitro:preset:vercel', () => {
  const ctx = setupTest('vercel')
  testNitro(ctx, async () => {
    const handle = await import(resolve(ctx.outDir, 'functions/node/server/index.mjs'))
      .then(r => r.default || r)
    await startServer(ctx, handle)
    return async ({ url }) => {
      const data = await ctx.fetch(url)
      return {
        data
      }
    }
  })
})
