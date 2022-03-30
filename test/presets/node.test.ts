import { resolve } from 'pathe'
import { describe } from 'vitest'
import { startServer, setupTest, testNitro } from '../utils'

describe('nitro:preset:node', () => {
  const ctx = setupTest('node')
  testNitro(ctx, async () => {
    const { app } = await import(resolve(ctx.outDir, 'server/index.mjs'))
    await startServer(ctx, app.nodeHandler)
    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return {
        data: await res.text(),
        status: res.status
      }
    }
  })
})
