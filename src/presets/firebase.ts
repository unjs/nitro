import { createRequire } from 'module'
import { join, relative, resolve } from 'pathe'
import fse from 'fs-extra'
import { globby } from 'globby'
import { readPackageJSON } from 'pkg-types'
import { writeFile } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const firebase = defineNitroPreset({
  entry: '#internal/nitro/entries/firebase',
  commands: {
    deploy: 'npx firebase deploy'
  },
  hooks: {
    async 'compiled' (ctx) {
      await writeRoutes(ctx)
    }
  }
})

async function writeRoutes (nitro: Nitro) {
  if (!fse.existsSync(join(nitro.options.rootDir, 'firebase.json'))) {
    const firebase = {
      functions: {
        source: relative(nitro.options.rootDir, nitro.options.output.serverDir)
      },
      hosting: [
        {
          site: '<your_project_id>',
          public: relative(nitro.options.rootDir, nitro.options.output.publicDir),
          cleanUrls: true,
          rewrites: [
            {
              source: '**',
              function: 'server'
            }
          ]
        }
      ]
    }
    await writeFile(resolve(nitro.options.rootDir, 'firebase.json'), JSON.stringify(firebase))
  }

  const _require = createRequire(import.meta.url)

  const jsons = await globby(join(nitro.options.output.serverDir, 'node_modules/**/package.json'))
  const prefixLength = `${nitro.options.output.serverDir}/node_modules/`.length
  const suffixLength = '/package.json'.length
  const dependencies = jsons.reduce((obj, packageJson) => {
    const dirname = packageJson.slice(prefixLength, -suffixLength)
    if (!dirname.includes('node_modules')) {
      obj[dirname] = _require(packageJson).version
    }
    return obj
  }, {} as Record<string, string>)

  let nodeVersion = '14'
  try {
    const currentNodeVersion = fse.readJSONSync(join(nitro.options.rootDir, 'package.json')).engines.node
    if (['16', '14'].includes(currentNodeVersion)) {
      nodeVersion = currentNodeVersion
    }
  } catch {
    const currentNodeVersion = process.versions.node.slice(0, 2)
    if (['16', '14'].includes(currentNodeVersion)) {
      nodeVersion = currentNodeVersion
    }
  }

  const getPackageVersion = async (id) => {
    const pkg = await readPackageJSON(id, { url: nitro.options.nodeModulesDirs })
    return pkg.version
  }

  await writeFile(
    resolve(nitro.options.output.serverDir, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        main: './index.mjs',
        dependencies: {
          'firebase-functions-test': 'latest',
          'firebase-admin': await getPackageVersion('firebase-admin'),
          'firebase-functions': await getPackageVersion('firebase-functions'),
          ...dependencies
        },
        engines: { node: nodeVersion }
      },
      null,
      2
    )
  )
}
