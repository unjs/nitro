import { promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { describe } from 'vitest'
import { EdgeRuntime } from 'edge-runtime'
import { setupTest, startServer, testNitro } from '../tests'

describe('nitro:preset:vercel', async () => {
  const ctx = await setupTest('vercel')
  testNitro(ctx, async () => {
    const handle = await import(resolve(ctx.outDir, 'functions/__nuxt.func/index.mjs'))
      .then(r => r.default || r)
    await startServer(ctx, handle)
    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return res
    }
  })
})

describe.skip('nitro:preset:vercel-edge', async () => {
  const ctx = await setupTest('vercel-edge')
  testNitro(ctx, async () => {
    // TODO: Add add-event-listener
    const entry = resolve(ctx.outDir, 'functions/__nuxt.func/index.mjs')
    const entryCode = await fsp.readFile(entry, 'utf8')
    const runtime = new EdgeRuntime({ initialCode: entryCode })
    return async ({ url }) => {
      const res = await runtime.dispatchFetch('http://localhost' + url)
      return res
    }
  })
})
