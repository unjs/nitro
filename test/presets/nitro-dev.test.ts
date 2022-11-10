import { describe } from 'vitest'
import { build, prepare } from '../../src/build.js'
import { createDevServer } from '../../src/dev/server.js'
import { setupTest, testNitro } from '../tests'

describe('nitro:preset:nitro-dev', async () => {
  const ctx = await setupTest('nitro-dev')
  testNitro(ctx, async () => {
    const devServer = createDevServer(ctx.nitro)
    ctx.server = await devServer.listen({})
    await prepare(ctx.nitro)
    const ready = new Promise<void>((resolve) => { ctx.nitro.hooks.hook('dev:reload', () => resolve()) })
    await build(ctx.nitro)
    await ready
    console.log('>', ctx.server!.url)

    return async ({ url }) => {
      const res = await ctx.fetch(url)
      return res
    }
  })
})
