import type { Plugin } from "rollup";

export function sourcemapIgnore() {
  return {
    name: "nitro:sourcemap-ignore",
    generateBundle(_options, bundle) {
      for (const [key, asset] of Object.entries(bundle)) {
        if (
          !key.endsWith(".map") ||
          !("source" in asset) ||
          typeof asset.source !== "string"
        ) {
          continue;
        }
        const sourcemap: { sources: string[] } = JSON.parse(asset.source);
        if ((sourcemap.sources || []).some((s) => s.includes("node_modules"))) {
          // TODO: Try to minify mappings only
          asset.source = `{"version":3,"sources":[],"names":[],"mappings":"","file":""}`;
        }
      }
    },
  } satisfies Plugin;
}
