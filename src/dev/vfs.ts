import { createError, eventHandler } from "h3";
import type { Nitro } from "../types";

export function createVFSHandler(nitro: Nitro) {
  return eventHandler(async (event) => {
    const vfsEntries = {
      ...nitro.vfs,
      ...nitro.options.virtual,
    };

    const items = Object.keys(vfsEntries)
      .map((key) => {
        const linkClass =
          event.req.url === `/${encodeURIComponent(key)}`
            ? "bg-gray-700 text-white"
            : "hover:bg-gray-800 text-gray-200";
        return `<li class="flex flex-nowrap"><a href="/_vfs/${encodeURIComponent(
          key
        )}" class="w-full text-sm px-2 py-1 border-b border-gray:10 ${linkClass}">${key.replace(
          nitro.options.rootDir,
          ""
        )}</a></li>`;
      })
      .join("\n");

    const filesList = `
      <div class="h-full overflow-auto border-r border-gray:10">
        <p class="text-white text-bold text-center py-1 opacity-50">Virtual Files</p>
        <ul class="flex flex-col border-t border-gray:10">${items}</ul>
      </div>
      `;

    const id = decodeURIComponent(event.req.url?.slice(1) || "");

    let file = "";
    if (id in vfsEntries) {
      let contents = vfsEntries[id];
      if (typeof contents === "function") {
        contents = await contents();
      }
      file = editorTemplate({
        readOnly: true,
        language: id.endsWith("html") ? "html" : "javascript",
        theme: "vs-dark",
        value: contents,
        wordWrap: "wordWrapColumn",
        wordWrapColumn: 80,
      });
    } else if (id) {
      throw createError({ message: "File not found", statusCode: 404 });
    } else {
      file = `
        <div class="w-full h-full flex opacity-50">
          <h1 class="text-white m-auto">Select a virtual file to inspect</h1>
        </div>
      `;
    }
    return `
<!doctype html>
<html>
<head>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@unocss/reset/tailwind.min.css" />
  <link rel="stylesheet" data-name="vs/editor/editor.main" href="${vsUrl}/editor/editor.main.min.css">
  <script src="https://cdn.jsdelivr.net/npm/@unocss/runtime"></script>
  <style>
    html {
      background: #1E1E1E;
      color: white;
    }
    [un-cloak] {
      display: none;
    }
  </style>
</head>
<body>
  <div un-cloak class="h-screen h-screen grid grid-cols-[300px_1fr]">
    ${filesList}
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
<div id="editor" class="min-h-screen w-full h-full"></div>
<script src="${vsUrl}/loader.min.js"></script>
<script>
  require.config({ paths: { vs: '${vsUrl}' } })

  const proxy = URL.createObjectURL(new Blob([\`
    self.MonacoEnvironment = { baseUrl: '${monacoUrl}' }
    importScripts('${vsUrl}/base/worker/workerMain.min.js')
  \`], { type: 'text/javascript' }))
  window.MonacoEnvironment = { getWorkerUrl: () => proxy }

  require(['vs/editor/editor.main'], function () {
    setTimeout(() => {
      monaco.editor.create(document.getElementById('editor'), ${JSON.stringify(
        options
      )})
    }, 0)
  })
</script>
`;
