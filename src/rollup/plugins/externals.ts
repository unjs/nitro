import { existsSync, promises as fsp } from 'fs'
import { resolve, dirname, normalize, join, isAbsolute } from 'pathe'
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

  const _resolveCache = new Map()
  const _resolve = async (id: string) => {
    let resolved = _resolveCache.get(id)
    if (resolved) { return resolved }
    resolved = await resolvePath(id, {
      conditions: opts.exportConditions,
      url: opts.moduleDirectories
    })
    _resolveCache.set(id, resolved)
    return resolved
  }

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

      // Check for explicit inlines
      if (opts.inline.find(i => (id.startsWith(i) || idWithoutNodeModules.startsWith(i)))) {
        return null
      }

      // Resolve id (rollup > esm)
      const resolved = await this.resolve(originalId, importer, { ...options, skipSelf: true }) || { id }
      if (!existsSync(resolved.id)) {
        resolved.id = await _resolve(resolved.id)
      }

      // Inline invalid node imports
      if (!await isValidNodeImport(resolved.id)) {
        return {
          ...resolved,
          external: false
        }
      }

      // Externalize with full path if trace is disabled
      if (opts.trace === false) {
        return {
          ...resolved,
          external: true
        }
      }

      // -- Trace externals --

      // Try to extract package name from path
      const { pkgName, subpath } = parseNodeModulePath(resolved.id)

      // Inline if cannot detect package name
      if (!pkgName) {
        return null
      }

      // Normally package name should be same as originalId
      // Edge cases: Subpath export and full paths
      if (pkgName !== originalId) {
        // Subpath export
        if (!isAbsolute(originalId)) {
          const fullPath = await _resolve(originalId)
          trackedExternals.add(fullPath)
          return {
            id: originalId,
            external: true
          }
        }

        // Absolute path, we are not sure about subpath to generate import statement
        // Guess as main subpath export
        const packageEntry = await _resolve(pkgName).catch(() => null)
        if (packageEntry !== originalId) {
          // Guess subpathexport
          const guessedSubpath = pkgName + subpath.replace(/\.[a-z]+$/, '')
          const resolvedGuess = await _resolve(guessedSubpath).catch(() => null)
          if (resolvedGuess === originalId) {
            trackedExternals.add(resolvedGuess)
            return {
              id: guessedSubpath,
              external: true
            }
          }
          // Inline since we cannot guess subpath
          return null
        }
      }

      trackedExternals.add(resolved.id)
      return {
        id: pkgName,
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
          console.warn(`Multiple versions of package ${pkgName} detected in:\n` + [
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
  const [, baseDir, pkgName, subpath] = /^(.+\/node_modules\/)([^@/]+|@[^/]+\/[^/]+)(\/?.*?)?$/.exec(path)
  return {
    baseDir,
    pkgName,
    subpath
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
