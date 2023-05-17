import { promises as fsp } from "node:fs";
import { relative, resolve } from "pathe";
import createEtag from "etag";
import mime from "mime";
import { globby } from "globby";
import type { Plugin } from "rollup";
import type { Nitro } from "../../types";
import { virtual } from "./virtual";

export function publicAssets(nitro: Nitro): Plugin {
  return virtual(
    {
      // #internal/nitro/virtual/public-assets-data
      "#internal/nitro/virtual/public-assets-data": async () => {
        const assets: Record<
          string,
          {
            type: string;
            etag: string;
            mtime: string;
            path: string;
            size: number;
            encoding?: string;
          }
        > = {};
        const files = await globby("**", {
          cwd: nitro.options.output.publicDir,
          absolute: false,
          dot: true,
        });
        for (const id of files) {
          let mimeType =
            mime.getType(id.replace(/\.(gz|br)$/, "")) || "text/plain";
          if (mimeType.startsWith("text")) {
            mimeType += "; charset=utf-8";
          }
          const fullPath = resolve(nitro.options.output.publicDir, id);
          const assetData = await fsp.readFile(fullPath);
          const etag = createEtag(assetData);
          const stat = await fsp.stat(fullPath);

          const assetId = "/" + decodeURIComponent(id);

          let encoding;
          if (id.endsWith(".gz")) {
            encoding = "gzip";
          } else if (id.endsWith(".br")) {
            encoding = "br";
          }

          assets[assetId] = {
            type: mimeType,
            encoding,
            etag,
            mtime: stat.mtime.toJSON(),
            size: stat.size,
            path: relative(nitro.options.output.serverDir, fullPath),
          };
        }

        return `export default ${JSON.stringify(assets, null, 2)};`;
      },
      // #internal/nitro/virtual/public-assets-node
      "#internal/nitro/virtual/public-assets-node": () => {
        return `
import { promises as fsp } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'pathe'
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`;
      },
      // #internal/nitro/virtual/public-assets-deno
      "#internal/nitro/virtual/public-assets-deno": () => {
        return `
import assets from '#internal/nitro/virtual/public-assets-data'
export function readAsset (id) {
  // https://deno.com/deploy/docs/serve-static-assets
  const path = '.' + new URL(\`../public\${id}\`, 'file://').pathname
  return Deno.readFile(path);
}`;
      },
      // #internal/nitro/virtual/public-assets
      "#internal/nitro/virtual/public-assets": () => {
        const publicAssetBases = Object.fromEntries(
          nitro.options.publicAssets
            .filter((dir) => !dir.fallthrough && dir.baseURL !== "/")
            .map((dir) => [dir.baseURL, { maxAge: dir.maxAge }])
        );

        return `
import assets from '#internal/nitro/virtual/public-assets-data'
${
  nitro.options.serveStatic
    ? `export * from "#internal/nitro/virtual/public-assets-${
        ["deno"].includes(nitro.options.serveStatic as string)
          ? nitro.options.serveStatic
          : "node"
      }"`
    : "export const readAsset = () => Promise.resolve(null)"
}

export const publicAssetBases = ${JSON.stringify(publicAssetBases)}

export function isPublicAssetURL(id = '') {
  if (assets[id]) {
    return true
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return true }
  }
  return false
}

export function getPublicAssetMeta(id = '') {
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) { return publicAssetBases[base] }
  }
  return {}
}

export function getAsset (id) {
  return assets[id]
}
`;
      },
    },
    nitro.vfs
  );
}
