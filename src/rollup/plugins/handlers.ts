import hasha from 'hasha'
import { relative } from 'pathe'
import table from 'table'
import isPrimitive from 'is-primitive'
import { isDebug } from 'std-env'
import type { Nitro, NitroEventHandler } from '../../types'
import { virtual } from './virtual'

const unique = (arr: any[]) => Array.from(new Set(arr))

export function handlers (nitro: Nitro) {
  const getImportId = p => '_' + hasha(p).slice(0, 6)

  let lastDump = ''

  return virtual({
    '#internal/nitro/virtual/server-handlers': () => {
      const handlers = [
        ...nitro.scannedHandlers,
        ...nitro.options.handlers
      ]
      if (nitro.options.serveStatic) {
        handlers.unshift({ route: '', handler: '#internal/nitro/static' })
      }
      if (nitro.options.renderer) {
        handlers.push({ route: '/**', handler: nitro.options.renderer })
      }

      if (isDebug) {
        const dumped = dumpHandler(handlers)
        if (dumped !== lastDump) {
          lastDump = dumped
          if (handlers.length) {
            console.log(dumped)
          }
        }
      }

      // Imports take priority
      const imports = unique(handlers.filter(h => h.lazy === false).map(h => h.handler))

      // Lazy imports should fill in the gaps
      const lazyImports = unique(handlers.filter(h => h.lazy !== false && !imports.includes(h.handler)).map(h => h.handler))

      const code = `
${imports.map(handler => `import ${getImportId(handler)} from '${handler}';`).join('\n')}

${lazyImports.map(handler => `const ${getImportId(handler)} = () => import('${handler}');`).join('\n')}

export const handlers = [
${handlers.map(h => `  { route: '${h.route || ''}', handler: ${getImportId(h.handler)}, lazy: ${!!h.lazy}, middleware: ${!!h.middleware}, method: ${JSON.stringify(h.method)} }`).join(',\n')}
];
  `.trim()
      return code
    }
  }, nitro.vfs)
}

function dumpHandler (handler: NitroEventHandler[]) {
  const data = handler.map(({ route, handler, ...props }) => {
    return [
      (route && route !== '/') ? route : '*',
      relative(process.cwd(), handler as string),
      dumpObject(props)
    ]
  })
  return table.table([
    ['Path', 'Handler', 'Options'],
    ...data
  ], {
    singleLine: true,
    border: table.getBorderCharacters('norc')
  })
}

function dumpObject (obj: any) {
  const items = []
  for (const key in obj) {
    const val = obj[key]
    items.push(`${key}: ${isPrimitive(val) ? val : JSON.stringify(val)}`)
  }
  return items.join(', ')
}
