#!/usr/bin/env node

import mri from 'mri'
import { resolve } from 'pathe'
import { createNitro } from './nitro'
import { build, prepare } from './build'
import { createDevServer } from './server/dev'
import { copyPublicAssets } from '.'

async function main () {
  const args = mri(process.argv.slice(2))
  const command = args._[0]
  const rootDir = resolve(args._[1] || '.')

  if (command === 'dev') {
    const nitro = await createNitro({
      rootDir,
      dev: true,
      preset: 'dev'
    })
    const server = createDevServer(nitro)
    await server.listen({})
    await prepare(nitro)
    await build(nitro)
    return
  }

  if (command === 'build') {
    const nitro = await createNitro({
      rootDir,
      dev: false,
      preset: 'server'
    })
    await prepare(nitro)
    await copyPublicAssets(nitro)
    await build(nitro)
    process.exit(0)
  }

  console.error(`Unknown command ${command}! Usage: nitro dev|build [rootDir]`)
  process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
