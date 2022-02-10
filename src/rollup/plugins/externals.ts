import { existsSync, promises as fsp } from 'fs'
import { resolve, dirname, normalize } from 'pathe'
import { nodeFileTrace, NodeFileTraceOptions } from '@vercel/nft'
import type { Plugin } from 'rollup'
import { resolvePath, isValidNodeImport, normalizeid } from 'mlly'

export interface NodeExternalsOptions {
  inline?: string[]
  external?: string[]
  outDir?: string
  trace?: boolean
  normalizeId?: boolean
  traceOptions?: NodeFileTraceOptions
  moduleDirectories?: string[]
  exportConditions?: string[]
  traceInclude?: string[]
}

export function externals (opts: NodeExternalsOptions): Plugin {
  const trackedExternals = new Set<string>()

  return {
    name: 'node-externals',
    async resolveId (id, importer, options) {
      // Skip internals
      if (!id || id.startsWith('\x00') || id.includes('?') || id.startsWith('#')) {
        return null
      }

      // Normalize path on windows
      const normalizedId = normalize(id)

      const _id = normalizedId.split('node_modules/').pop()
      if (!opts.external.find(i => _id.startsWith(i) || id.startsWith(i))) {
        // Resolve relative paths and exceptions
        // Ensure to take absolute and relative id
        if (_id.startsWith('.') || opts.inline.find(i => _id.startsWith(i) || normalizedId.startsWith(i))) {
          return null
        }
      }

      // Resolve external (rollup => node)
      const resolved = await this.resolve(id, importer, { ...options, skipSelf: true }) || { id }
      if (!existsSync(resolved.id)) {
        resolved.id = await resolvePath(resolved.id, {
          conditions: opts.exportConditions,
          url: opts.moduleDirectories
        })
      }

      // Ensure id is a valid import
      if (!await isValidNodeImport(resolved.id)) {
        return {
          ...resolved,
          external: false
        }
      }

      // Track externals
      trackedExternals.add(resolved.id)

      // Normalize id with explicit protocol
      if (opts.normalizeId) {
        resolved.id = normalizeid(resolved.id)
      }

      return {
        ...resolved,
        external: true
      }
    },
    async buildEnd () {
      if (opts.trace !== false) {
        for (const pkgName of opts.traceInclude || []) {
          const path = await this.resolve(pkgName)
          if (path?.id) {
            trackedExternals.add(path.id)
          }
        }
        const tracedFiles = await nodeFileTrace(Array.from(trackedExternals), opts.traceOptions)
          .then(r => Array.from(r.fileList).map(f => resolve(opts.traceOptions.base, f)))
          .then(r => r.filter(file => file.includes('node_modules')))

        // // Find all unique package names
        const pkgs = new Set<string>()
        for (const file of tracedFiles) {
          const [, baseDir, pkgName] = /^(.+\/node_modules\/)([^@/]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(file)
          pkgs.add(resolve(baseDir, pkgName, 'package.json'))
        }

        for (const pkg of pkgs) {
          if (!tracedFiles.includes(pkg)) {
            tracedFiles.push(pkg)
          }
        }

        const writeFile = async (file) => {
          if (!await isFile(file)) { return }
          const src = resolve(opts.traceOptions.base, file)
          const dst = resolve(opts.outDir, 'node_modules', file.replace(/^.*?node_modules[\\/](.*)$/, '$1'))
          await fsp.mkdir(dirname(dst), { recursive: true })
          await fsp.copyFile(src, dst)
        }
        if (process.platform === 'win32') {
          // Workaround for EBUSY on windows (#424)
          for (const file of tracedFiles) {
            await writeFile(file)
          }
        } else {
          await Promise.all(tracedFiles.map(writeFile))
        }
      }
    }
  }
}

async function isFile (file: string) {
  try {
    const stat = await fsp.stat(file)
    return stat.isFile()
  } catch (err) {
    if (err.code === 'ENOENT') { return false }
    throw err
  }
}
