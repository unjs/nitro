import { expect, describe, it } from "vitest";
import { publicAssets } from "../../src/rollup/plugins/public-assets";
import { createNitro } from "../../src/nitro";


describe('public-assets:virtual', () => {
  it ('loads bun virtual public assets', async () => {
    const nitro = await createNitro({
      preset: "bun",
    });
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
})