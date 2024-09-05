import { promises as fsp } from "node:fs";
import createEtag from "etag";
import { globby } from "globby";
import mime from "mime";
import type { Nitro } from "nitro/types";
import type { PublicAsset } from "nitro/types";
import { relative, resolve } from "pathe";
import type { Plugin } from "rollup";
import { withTrailingSlash } from "ufo";
import { virtual } from "./virtual";

const readAssetHandler: Record<
  Exclude<Nitro["options"]["serveStatic"] | "true" | "false", boolean>,
  "node" | "deno" | "null" | "inline"
> = {
  true: "node",
  node: "node",
  false: "null",
  deno: "deno",
  inline: "inline",
};

export function publicAssets(nitro: Nitro): Plugin {
  return virtual(
    {
      // #nitro-internal-virtual/public-assets-data
      "#nitro-internal-virtual/public-assets-data": async () => {
        const assets: Record<string, PublicAsset> = {};
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
            type: nitro._prerenderMeta?.[assetId]?.contentType || mimeType,
            encoding,
            etag,
            mtime: stat.mtime.toJSON(),
            size: stat.size,
            path: relative(nitro.options.output.serverDir, fullPath),
            data:
              nitro.options.serveStatic === "inline"
                ? assetData.toString("base64")
                : undefined,
          };
        }

        return `export default ${JSON.stringify(assets, null, 2)};`;
      },
      // #nitro-internal-virtual/public-assets-node
      "#nitro-internal-virtual/public-assets-node": () => {
        return `
import { promises as fsp } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'pathe'
import assets from '#nitro-internal-virtual/public-assets-data'
export function readAsset (id) {
  const serverDir = dirname(fileURLToPath(import.meta.url))
  return fsp.readFile(resolve(serverDir, assets[id].path))
}`;
      },
      // #nitro-internal-virtual/public-assets-deno
      "#nitro-internal-virtual/public-assets-deno": () => {
        return `
import assets from '#nitro-internal-virtual/public-assets-data'
export function readAsset (id) {
  // https://deno.com/deploy/docs/serve-static-assets
  const path = '.' + decodeURIComponent(new URL(\`../public\${id}\`, 'file://').pathname)
  return Deno.readFile(path);
}`;
      },
      // #nitro-internal-virtual/public-assets-null
      "#nitro-internal-virtual/public-assets-null": () => {
        return `
    export function readAsset (id) {
        return Promise.resolve(null);
    }`;
      },
      // #nitro-internal-virtual/public-assets-inline
      "#nitro-internal-virtual/public-assets-inline": () => {
        return `
  import assets from '#nitro-internal-virtual/public-assets-data'
  export function readAsset (id) {
    if (!assets[id]) { return undefined }
    if (assets[id]._data) { return assets[id]._data }
    if (!assets[id].data) { return assets[id].data }
    assets[id]._data = Uint8Array.from(atob(assets[id].data), (c) => c.charCodeAt(0))
    return assets[id]._data
}`;
      },
      // #nitro-internal-virtual/public-assets
      "#nitro-internal-virtual/public-assets": () => {
        const publicAssetBases = Object.fromEntries(
          nitro.options.publicAssets
            .filter((dir) => !dir.fallthrough && dir.baseURL !== "/")
            .map((dir) => [
              withTrailingSlash(dir.baseURL),
              { maxAge: dir.maxAge },
            ])
        );

        // prettier-ignore
        // biome-ignore format: -
        type _serveStaticAsKey = Exclude<typeof nitro.options.serveStatic, boolean> | "true" | "false";
        // prettier-ignore
        // biome-ignore format: -
        const handlerName = readAssetHandler[nitro.options.serveStatic as _serveStaticAsKey] || "null";
        const readAssetImport = `#nitro-internal-virtual/public-assets-${handlerName}`;

        return `
import assets from '#nitro-internal-virtual/public-assets-data'
export { readAsset } from "${readAssetImport}"
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
