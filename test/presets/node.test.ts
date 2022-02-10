import { resolve } from 'pathe'
import { describe } from 'vitest'
import { startServer, setupTest, testNitro } from '../utils'

describe('nitro:preset:node', () => {
  const ctx = setupTest('node')
  testNitro(ctx, async () => {
    const { handle } = await import(resolve(ctx.outDir, 'server/index.mjs'))
    await startServer(ctx, handle)
    return async ({ url }) => {
      const data = await ctx.fetch(url)
      return {
        data
      }
    }
  })
})
