import { nodeResolve } from "@rollup/plugin-node-resolve";
import type { Nitro, NitroOptions } from "../../types";

const rKeys = (runtimeKeys: string | string[], conditions: string[]) => {
  const keys = Array.isArray(runtimeKeys) ? runtimeKeys : [runtimeKeys];
  return [...keys, ...conditions.filter((c) => !new Set(keys).has(c))];
};

// https://github.com/rollup/plugins/tree/master/packages/node-resolve
export const nodeResolvePlugin = (nitro: Nitro, extensions: string[]) => {
  const defaultExportConditions = [
    "default",
    nitro.options.dev ? "development" : "production",
    "module",
    "node",
    "import",
  ];

  /**
   * Attempt to match generic non-node runtime first,
   * then try to match providers runtime keys,
   * then finally browser, deno and node.
   * https://runtime-keys.proposal.wintercg.org/
   */
  const workerExportConditions = [
    "wintercg",
    "worker",
    "web",
    "workerd",
    "edge-light",
    "lagon",
    "netlify",
    "edge-routine",
    "browser",
    "import",
    "module",
    "deno",
    "default",
    nitro.options.dev ? "development" : "production",
    "node",
  ];

  const getExportConditions = (preset: NitroOptions["preset"]) => {
    switch (preset) {
      case "node-server":
      case "node-cluster":
      case "node": {
        return rKeys("node", defaultExportConditions);
      }
      case "bun": {
        return rKeys("bun", defaultExportConditions);
      }
      case "deno": {
        return rKeys("deno", workerExportConditions);
      }
      case "netlify-edge": {
        return rKeys("netlify", workerExportConditions);
      }
      case "lagon": {
        return rKeys("lagon", workerExportConditions);
      }
      case "vercel-edge": {
        return rKeys(["edge-light", "http"], workerExportConditions);
      }
      case "cloudflare-pages":
      case "cloudflare-module":
      case "cloudflare": {
        return rKeys("workerd", workerExportConditions);
      }
      default: {
        return defaultExportConditions;
      }
    }
  };

  return nodeResolve({
    extensions,
    preferBuiltins: !!nitro.options.node,
    rootDir: nitro.options.rootDir,
    modulePaths: nitro.options.nodeModulesDirs,
    // 'module' is intentionally not supported because of externals
    mainFields: ["main"],
    exportConditions:
      nitro.options.exportConditions ??
      getExportConditions(nitro.options.preset),
  });
};
