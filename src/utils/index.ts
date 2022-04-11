import { createRequire } from 'module'
import { relative, dirname, resolve } from 'pathe'
import fse from 'fs-extra'
import jiti from 'jiti'
import consola from 'consola'
import chalk from 'chalk'
import { getProperty } from 'dot-prop'
import { provider } from 'std-env'
import { Nitro } from '../types'

export function hl (str: string) {
  return chalk.cyan(str)
}

export function prettyPath (p: string, highlight = true) {
  p = relative(process.cwd(), p)
  return highlight ? hl(p) : p
}

export function compileTemplate (contents: string) {
  return (params: Record<string, any>) => contents.replace(/{{ ?([\w.]+) ?}}/g, (_, match) => {
    const val = getProperty<Record<string, string>, string>(params, match)
    if (!val) {
      consola.warn(`cannot resolve template param '${match}' in ${contents.slice(0, 20)}`)
    }
    return val || `${match}`
  })
}

export function jitiImport (dir: string, path: string) {
  return jiti(dir, { interopDefault: true })(path)
}

export function tryImport (dir: string, path: string) {
  try {
    return jitiImport(dir, path)
  } catch (_err) { }
}

export async function writeFile (file: string, contents: string, log = false) {
  await fse.mkdirp(dirname(file))
  await fse.writeFile(file, contents, 'utf-8')
  if (log) {
    consola.info('Generated', prettyPath(file))
  }
}

export function resolvePath (path: string, nitroOptions: Nitro['options'], base?: string): string {
  if (typeof path !== 'string') {
    throw new TypeError('Invalid path: ' + path)
  }

  // TODO: Skip if no template used
  path = compileTemplate(path)(nitroOptions)
  for (const base in nitroOptions.alias) {
    if (path.startsWith(base)) {
      path = nitroOptions.alias[base] + path.substring(base.length)
    }
  }

  return resolve(base || nitroOptions.srcDir, path)
}

export function replaceAll (input: string, from: string, to: string) {
  return input.replace(new RegExp(from, 'g'), to)
}

const autodetectableProviders = {
  azure_static: 'azure',
  netlify: 'netlify',
  vercel: 'vercel'
}

export function detectTarget () {
  return autodetectableProviders[provider]
}

export async function isDirectory (path: string) {
  try {
    return (await fse.stat(path)).isDirectory()
  } catch (_err) {
    return false
  }
}

const _getDependenciesMode = {
  dev: ['devDependencies'],
  prod: ['dependencies'],
  all: ['devDependencies', 'dependencies']
}
const _require = createRequire(import.meta.url)
export function getDependencies (dir: string, mode: keyof typeof _getDependenciesMode = 'all') {
  const fields = _getDependenciesMode[mode]
  const pkg = _require(resolve(dir, 'package.json'))
  const dependencies = []
  for (const field of fields) {
    if (pkg[field]) {
      for (const name in pkg[field]) {
        dependencies.push(name)
      }
    }
  }
  return dependencies
}

// TODO: Refactor to scule (https://github.com/unjs/scule/issues/6)
export function serializeImportName (id: string) {
  return '_' + id.replace(/[^a-zA-Z0-9_$]/g, '_')
}

export function readPackageJson (
  packageName: string,
  _require: NodeRequire = createRequire(import.meta.url)
) {
  try {
    return _require(`${packageName}/package.json`)
  } catch (error) {
    if (error.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED') {
      const pkgModulePaths = /^(.*\/node_modules\/).*$/.exec(_require.resolve(packageName))
      for (const pkgModulePath of pkgModulePaths || []) {
        const path = resolve(pkgModulePath, packageName, 'package.json')
        if (fse.existsSync(path)) {
          return fse.readJSONSync(path)
        }
        continue
      }

      throw error
    }
    throw error
  }
}

export function resolveAliases (aliases: Record<string, string>) {
  for (const key in aliases) {
    for (const alias in aliases) {
      if (!['~', '@', '#'].includes(alias[0])) { continue }
      if (alias === '@' && !aliases[key].startsWith('@/')) { continue } // Don't resolve @foo/bar

      if (aliases[key].startsWith(alias)) {
        aliases[key] = aliases[alias] + aliases[key].slice(alias.length)
      }
    }
  }
  return aliases
}
