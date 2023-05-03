import { expect, describe, it } from "vitest";
import { publicAssets } from "../../src/rollup/plugins/public-assets";
import { createNitro } from "../../src/nitro";


describe('public-assets:virtual', () => {
  it ('exports the correct public assets per preset', async () => {
    const virtualAssetsId = '\0virtual:#internal/nitro/virtual/public-assets';

    const nitroBun = await createNitro({ preset: "bun" })
    const nitroDeno = await createNitro({ preset: "deno" })
    const nitroNode = await createNitro({})

    const pluginBun = publicAssets(nitroBun)
    const pluginDeno = publicAssets(nitroDeno)
    const pluginNode = publicAssets(nitroNode)

    // @ts-expect-error
    const { code: bunCode } = await pluginBun.load(virtualAssetsId)
    // @ts-expect-error
    const { code: denoCode } = await pluginDeno.load(virtualAssetsId)
    // @ts-expect-error
    const { code: nodeCode } = await pluginNode.load(virtualAssetsId)

    expect(bunCode).toContain('export * from "#internal/nitro/virtual/public-assets-bun"')
    expect(denoCode).toContain('export * from "#internal/nitro/virtual/public-assets-deno"')
    expect(nodeCode).toContain('export * from "#internal/nitro/virtual/public-assets-node"')
  })

  it ('loads bun virtual public assets', async () => {
    const nitro = await createNitro({
      preset: "bun",
    })
    const res = publicAssets(nitro)
    // @ts-expect-error
    const resolved = res.resolveId('#internal/nitro/virtual/public-assets-bun')
    expect(resolved).toBe('\0virtual:#internal/nitro/virtual/public-assets-bun')
    // @ts-expect-error
    const { code } = await res.load(resolved)
    expect(code).toStrictEqual(`
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'pathe'
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return Bun.file(resolve(serverDir, assets[id].path)).text()
}`)
  })

  it ('loads deno virtual public assets', async () => {
    const nitro = await createNitro({
      preset: "deno",
    })
    const res = publicAssets(nitro)
    // @ts-expect-error
    const resolved = res.resolveId('#internal/nitro/virtual/public-assets-deno')
    expect(resolved).toBe('\0virtual:#internal/nitro/virtual/public-assets-deno')
    // @ts-expect-error
    const { code } = await res.load(resolved)
    expect(code).toStrictEqual(`
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  // https://deno.com/deploy/docs/serve-static-assets
  const path = '.' + new URL(\`../public\${id}\`, 'file://').pathname
  return Deno.readFile(path);
}`)
  })

  it ('loads node virtual public assets', async () => {
    const nitro = await createNitro({})
    const res = publicAssets(nitro)
    // @ts-expect-error
    const resolved = res.resolveId('#internal/nitro/virtual/public-assets-node')
    expect(resolved).toBe('\0virtual:#internal/nitro/virtual/public-assets-node')
    // @ts-expect-error
    const { code } = await res.load(resolved)
    expect(code).toStrictEqual(`
import { promises as fsp } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'pathe'
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`)
  })
})