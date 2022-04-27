import { promises as fsp } from 'fs'
import { extname } from 'pathe'
import type { Plugin } from 'rollup'

export interface RawOptions {
  extensions?: string[]
}

export function raw (opts: RawOptions = {}): Plugin {
  const extensions = new Set(['.md', '.mdx', '.yml', '.txt', '.css', '.htm', '.html']
    .concat(opts.extensions || []))

  return {
    name: 'raw',
    resolveId (id) {
      if (id.startsWith('raw:')) {
        return '\0' + id
      }
    },
    load (id) {
      if (id.startsWith('\0raw:')) {
        return fsp.readFile(id.substring(5), 'utf8')
      }
    },
    transform (code, id) {
      if (id.startsWith('\0raw:')) {
        id = id.substring(5)
      } else if (id[0] === '\0' || !extensions.has(extname(id))) {
        return null
      }
      return {
        code: `// ROLLUP_NO_REPLACE \n export default ${JSON.stringify(code)}`,
        map: null
      }
    }
  }
}
