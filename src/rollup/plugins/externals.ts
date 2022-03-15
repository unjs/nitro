import { existsSync, promises as fsp } from 'fs'
import { resolve, dirname, normalize, join } from 'pathe'
import { nodeFileTrace, NodeFileTraceOptions } from '@vercel/nft'
import type { Plugin } from 'rollup'
import { resolvePath, isValidNodeImport } from 'mlly'

export interface NodeExternalsOptions {
  inline?: string[]
  external?: string[]
  outDir?: string
  trace?: boolean
  traceOptions?: NodeFileTraceOptions
  moduleDirectories?: string[]
  exportConditions?: string[]
  traceInclude?: string[]
}

export function externals (opts: NodeExternalsOptions): Plugin {
  const trackedExternals = new Set<string>()

  return {
    name: 'node-externals',
    async resolveId (originalId, importer, options) {
      // Skip internals
      if (!originalId || originalId.startsWith('\x00') || originalId.includes('?') || originalId.startsWith('#')) {
        return null
      }

      // Skip relative paths
      if (originalId.startsWith('.')) {
        return null
      }

      // Normalize path (windows)
      const id = normalize(originalId)

      // Id without .../node_modules/
      const idWithoutNodeModules = id.split('node_modules/').pop()

      // const matchedExternal = opts.external.find(i => idWithoutNodeModules.startsWith(i) || id.startsWith(i))

      // Check for explicit inlines
      if (opts.inline.find(i => (id.startsWith(i) || idWithoutNodeModules.startsWith(i)))) {
        return null
      }

      // Resolve id (rollup then native node ESM)
      const resolved = await this.resolve(originalId, importer, { ...options, skipSelf: true }) || { id }
      if (!existsSync(resolved.id)) {
        resolved.id = await resolvePath(resolved.id, {
          conditions: opts.exportConditions,
          url: opts.moduleDirectories
        })
      }

      // Inline invalid node imports
      if (!await isValidNodeImport(resolved.id)) {
        return {
          ...resolved,
          external: false
        }
      }

      // Track externals
      trackedExternals.add(resolved.id)

      // Try to extract package name from path
      const { pkgName } = parseNodeModulePath(resolved.id)

      // Inline in trace-mode when cannot extract package name
      if (!pkgName && opts.trace !== false) {
        return null
      }

      // External with package name in trace mode
      if (opts.trace !== false) {
        return {
          id: pkgName,
          external: true
        }
      }

      // External with full pack in normal mode
      return {
        ...resolved,
        external: true
      }
    },
    async buildEnd () {
      if (opts.trace === false) {
        return
      }

      // Force trace paths
      for (const pkgName of opts.traceInclude || []) {
        const path = await this.resolve(pkgName)
        if (path?.id) {
          trackedExternals.add(path.id)
        }
      }

      // Trace files
      const tracedFiles = await nodeFileTrace(Array.from(trackedExternals), opts.traceOptions)
        .then(r => Array.from(r.fileList).map(f => resolve(opts.traceOptions.base, f)))
        .then(r => r.filter(file => file.includes('node_modules')))

      // Keep track of npm packages
      const tracedPackages = new Map() // name => pkgDir
      for (const file of tracedFiles) {
        const { baseDir, pkgName } = parseNodeModulePath(file)
        const pkgDir = resolve(baseDir, pkgName)

        // Check for duplicate versions
        const existingPkgDir = tracedPackages.get(pkgName)
        if (existingPkgDir && existingPkgDir !== pkgDir) {
          console.warn(`Multiple versions of package ${pkgName} detected in:\n`, [
            existingPkgDir,
            pkgDir
          ].map(p => '  - ' + p).join('\n'))
          continue
        }

        // Add to traced packages
        tracedPackages.set(pkgName, pkgDir)
      }

      // Ensure all package.json files are traced
      for (const pkgDir of tracedPackages.values()) {
        const pkgJSON = join(pkgDir, 'package.json')
        if (!tracedFiles.includes(pkgJSON)) {
          tracedFiles.push(pkgJSON)
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

      // Write an informative package.json
      await fsp.writeFile(resolve(opts.outDir, 'package.json'), JSON.stringify({
        private: true,
        bundledDependencies: Array.from(tracedPackages.keys())
      }, null, 2), 'utf8')
    }
  }
}

function parseNodeModulePath (path: string) {
  const [, baseDir, pkgName] = /^(.+\/node_modules\/)([^@/]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(path)
  return {
    baseDir,
    pkgName
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
