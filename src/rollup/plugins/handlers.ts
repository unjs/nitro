import { hash } from "ohash";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

const unique = (arr: any[]) => [...new Set(arr)];
const getImportId = (p: string, lazy?: boolean) =>
  (lazy ? "_lazy_" : "_") + hash(p).slice(0, 6);

export function handlers(nitro: Nitro) {
  return virtual(
    {
      "#internal/nitro/virtual/server-handlers": () => {
        const handlers = [...nitro.scannedHandlers, ...nitro.options.handlers];
        if (nitro.options.serveStatic) {
          handlers.unshift({
            middleware: true,
            handler: "#internal/nitro/static",
          });
        }
        if (nitro.options.renderer) {
          handlers.push({
            route: "/**",
            lazy: true,
            handler: nitro.options.renderer,
          });
        }

        // Imports take priority
        const imports = unique(
          handlers.filter((h) => !h.lazy).map((h) => h.handler)
        );

        // Lazy imports should fill in the gaps
        // TODO: At least warn if a handler is imported both lazy and non lazy
        const lazyImports = unique(
          handlers.filter((h) => h.lazy).map((h) => h.handler)
        );

        const code = `
${imports
  .map((handler) => `import ${getImportId(handler)} from '${handler}';`)
  .join("\n")}

${lazyImports
  .map(
    (handler) =>
      `const ${getImportId(handler, true)} = () => import('${handler}');`
  )
  .join("\n")}

export const handlers = [
${handlers
  .map(
    (h) =>
      `  { route: '${h.route || ""}', handler: ${getImportId(
        h.handler,
        h.lazy
      )}, lazy: ${!!h.lazy}, middleware: ${!!h.middleware}, method: ${JSON.stringify(
        h.method
      )} }`
  )
  .join(",\n")}
];
  `.trim();
        return code;
      },
    },
    nitro.vfs
  );
}
