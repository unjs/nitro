import { describe } from 'vitest'
import { startDevServer, setupTest, testNitro } from '../tests'

describe('nitro:preset:nitro-dev', async () => {
  const ctx = await setupTest('nitro-dev')
  testNitro(ctx, async () => {
    await startDevServer(ctx)
    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return res
    }
  })
})
