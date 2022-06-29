import { createError, eventHandler } from 'h3'
import type { Nitro } from '../types'

export function createVFSHandler (nitro: Nitro) {
  return eventHandler(async (event) => {
    const vfsEntries = {
      ...nitro.vfs,
      ...nitro.options.virtual
    }

    const items = Object.keys(vfsEntries)
      .map((key) => {
        const linkClass = event.req.url === `/${encodeURIComponent(key)}` ? 'bg-gray-700 text-white' : 'hover:bg-gray-800 text-gray-200'
        return `<li class="flex flex-nowrap"><a href="/_vfs/${encodeURIComponent(key)}" class="w-full text-sm px-2 py-1 border-b border-gray-500 ${linkClass}">${key.replace(nitro.options.rootDir, '')}</a></li>`
      })
      .join('\n')
    const files = `<ul class="flex flex-col">${items}</ul>`

    const id = decodeURIComponent(event.req.url?.slice(1) || '')

    let file = ''
    if (id in vfsEntries) {
      let contents = vfsEntries[id]
      if (typeof contents === 'function') {
        contents = await contents()
      }
      file = editorTemplate({
        readOnly: true,
        language: id.endsWith('html') ? 'html' : 'javascript',
        theme: 'vs-dark',
        value: contents,
        wordWrap: 'wordWrapColumn',
        wordWrapColumn: 80
      })
    } else if (id) {
      throw createError({ message: 'File not found', statusCode: 404 })
    }
    return `
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css" />
  <link rel="stylesheet" data-name="vs/editor/editor.main" href="${vsUrl}/editor/editor.main.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
</head>
<body class="bg-[#1E1E1E]">
  <div class="flex">
    ${files}
    ${file}
  </div>
</body>
</html>`
  })
}

const monacoVersion = '0.30.0'
const monacoUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${monacoVersion}/min`
const vsUrl = `${monacoUrl}/vs`

const editorTemplate = (options: Record<string, any>) => `
<div id="editor" class="min-h-screen flex-1"></div>
<script src="${vsUrl}/loader.min.js"></script>
<script>
  require.config({ paths: { vs: '${vsUrl}' } })

  const proxy = URL.createObjectURL(new Blob([\`
    self.MonacoEnvironment = { baseUrl: '${monacoUrl}' }
    importScripts('${vsUrl}/base/worker/workerMain.min.js')
  \`], { type: 'text/javascript' }))
  window.MonacoEnvironment = { getWorkerUrl: () => proxy }

  require(['vs/editor/editor.main'], function () {
    monaco.editor.create(document.getElementById('editor'), ${JSON.stringify(options)})
  })
</script>
`
