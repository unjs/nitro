import { resolve } from 'pathe'
import { describe } from 'vitest'
import { setupTest, startServer, testNitro } from '../tests'

describe('nitro:preset:vercel', async () => {
  const ctx = await setupTest('vercel')
  testNitro(ctx, async () => {
    const handle = await import(resolve(ctx.outDir, 'functions/node/server/index.mjs'))
      .then(r => r.default || r)
    await startServer(ctx, handle)
    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return res
    }
  })
})

describe('nitro:preset:vercel', async () => {
  const ctx = await setupTest('vercel-edge')
  testNitro(ctx, async () => {
    const handle = await import(resolve(ctx.outDir, 'functions/node/server/index.mjs'))
      .then(r => r.default || r)
    await startServer(ctx, handle)
    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return res
    }
  })
})
