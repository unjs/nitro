import { extname } from "pathe";
import type { Plugin, RenderedChunk } from "rollup";

// TODO
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface Options {}

const TIMING = "globalThis.__timing__";

const iife = (code) =>
  `(function() { ${code.trim()} })();`.replaceAll("\n", "");

const HELPER = iife(`
const start = () => Date.now();
const end = s => Date.now() - s;
const _s = {};
const metrics = [];
const logStart = id => { _s[id] = Date.now(); };
const logEnd = id => { const t = end(_s[id]); delete _s[id]; metrics.push([id, t]); console.debug('>', id + ' (' + t + 'ms)'); };
${TIMING} = { start, end, metrics, logStart, logEnd };
`);

const HELPERIMPORT = "import './timing.js';";

export function timing(_opts: Options = {}): Plugin {
  return {
    name: "timing",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "timing.js",
        source: HELPER,
      });
    },
    renderChunk(code, chunk: RenderedChunk) {
      let name = chunk.fileName || "";
      name = name.replace(extname(name), "");
      const logName = name === "index" ? "Nitro Start" : "Load " + name;
      return {
        code:
          (chunk.isEntry ? HELPERIMPORT : "") +
          `${TIMING}.logStart('${logName}');` +
          code +
          `;${TIMING}.logEnd('${logName}');`,
        map: null,
      };
    },
  };
}
