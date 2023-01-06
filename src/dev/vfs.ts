import { createError, eventHandler } from "h3";
import type { Nitro } from "../types";

export function createVFSHandler(nitro: Nitro) {
  return eventHandler(async (event) => {
    const vfsEntries = {
      ...nitro.vfs,
      ...nitro.options.virtual,
    };

    const url = event.node.req.url || '';
    const isJson = event.node.req.headers.accept?.includes("application/json") || url.startsWith('.json')
    const id = decodeURIComponent(url.replace(/^(\.json)?\/?/, '') || "");

    if (id && !(id in vfsEntries)) { 
      throw createError({ message: "File not found", statusCode: 404 }); 
    }

    let content = id ? vfsEntries[id] : undefined;
    if (typeof content === "function") {
      content = await content();
    }

    if (isJson) {
      return {
        rootDir: nitro.options.rootDir,
        entries: Object.keys(vfsEntries).map(id => ({
          id,
          path: '/_vfs.json/' + encodeURIComponent(id)
        })),
        current: id
          ? {
              id,
              content
            }
          : null
      }
    }

    const items = Object.keys(vfsEntries)
      .map((key) => {
        const linkClass =
          url === `/${encodeURIComponent(key)}`
            ? "bg-gray-700 text-white"
            : "hover:bg-gray-800 text-gray-200";
        return `<li class="flex flex-nowrap"><a href="/_vfs/${encodeURIComponent(
          key
        )}" class="w-full text-sm px-2 py-1 border-b border-gray-500 ${linkClass}">${key.replace(
          nitro.options.rootDir,
          ""
        )}</a></li>`;
      })
      .join("\n");

    const files = `
      <div>
        <p class="bg-gray-700 text-white text-bold border-b border-gray-500 text-center">virtual files</p>
        <ul class="flex flex-col">${items}</ul>
      </div>
      `;

    let file = "";
    file = id in vfsEntries
      ? editorTemplate({
        readOnly: true,
        language: id.endsWith("html") ? "html" : "javascript",
        theme: "vs-dark",
        value: content,
        wordWrap: "wordWrapColumn",
        wordWrapColumn: 80,
      })
      : `
        <div class="m-2">
          <h1 class="text-white">Select a virtual file to inspect</h1>
        </div>
      `;

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
</html>`;
  });
}

const monacoVersion = "0.30.0";
const monacoUrl = `https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/${monacoVersion}/min`;
const vsUrl = `${monacoUrl}/vs`;

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
    monaco.editor.create(document.getElementById('editor'), ${JSON.stringify(
      options
    )})
  })
</script>
`;
