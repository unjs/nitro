import hasha from 'hasha'
import { relative } from 'pathe'
import table from 'table'
import isPrimitive from 'is-primitive'
import { isDebug } from 'std-env'
import type { NitroHandlerConfig } from '../../types'
import virtual from './virtual'

const unique = (arr: any[]) => Array.from(new Set(arr))

export function handlers (getHandlers: () => NitroHandlerConfig[]) {
  const getImportId = p => '_' + hasha(p).slice(0, 6)

  let lastDump = ''

  return virtual({
    '#server-handlers': {
      load: () => {
        const handler = getHandlers()

        if (isDebug) {
          const dumped = dumpHandler(handler)
          if (dumped !== lastDump) {
            lastDump = dumped
            if (handler.length) {
              console.log(dumped)
            }
          }
        }

        // Imports take priority
        const imports = unique(handler.filter(m => m.lazy === false).map(m => m.handler))

        // Lazy imports should fill in the gaps
        const lazyImports = unique(handler.filter(m => m.lazy !== false && !imports.includes(m.handler)).map(m => m.handler))

        const code = `
${imports.map(handler => `import ${getImportId(handler)} from '${handler}';`).join('\n')}

${lazyImports.map(handler => `const ${getImportId(handler)} = () => import('${handler}');`).join('\n')}

const handlers = [
${handler.map(m => `  { route: '${m.route || '/'}', handler: ${getImportId(m.handler)}, lazy: ${m.lazy || true} }`).join(',\n')}
];

export default handlers
  `.trim()
        // console.log(code)
        return code
      }
    }
  })
}

function dumpHandler (handler: NitroHandlerConfig[]) {
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
