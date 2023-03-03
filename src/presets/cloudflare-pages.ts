import { promises as fsp } from "node:fs";
import { resolve } from "pathe";
import { joinURL, withLeadingSlash, withoutLeadingSlash } from "ufo";
import { globby } from "globby";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const cloudflarePages = defineNitroPreset({
  extends: "cloudflare",
  entry: "#internal/nitro/entries/cloudflare-pages",
  commands: {
    preview: "npx wrangler pages dev ./",
    deploy: "npx wrangler pages publish ./",
  },
  output: {
    dir: "{{ rootDir }}/dist",
    publicDir: "{{ output.dir }}",
    serverDir: "{{ output.dir }}",
  },
  alias: {
    // Hotfix: Cloudflare appends /index.html if mime is not found and things like ico are not in standard lite.js!
    // https://github.com/unjs/nitro/pull/933
    _mime: "mime/index.js",
  },
  rollupConfig: {
    output: {
      entryFileNames: "_worker.js",
      format: "esm",
    },
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeCFRoutes(nitro);
    },
  },
});

/**
 * https://developers.cloudflare.com/pages/platform/functions/routing/#functions-invocation-routes
 */
interface CloudflarePagesRoutes {
  version: 1;
  include: string[];
  exclude: string[];
}

async function writeCFRoutes(nitro: Nitro) {
  const routes: CloudflarePagesRoutes = {
    version: 1,
    include: ["/*"],
    exclude: [],
  };

  // Exclude public assets from hitting the worker
  const explicitPublicAssets = nitro.options.publicAssets.filter(
    (i) => !i.fallthrough
  );

  // Explicit prefixes
  routes.exclude.push(
    ...explicitPublicAssets
      .map((dir) => joinURL(dir.baseURL, "*"))
      .sort(comparePaths)
  );

  // Unprefixed assets
  const publicAssetFiles = await globby("**", {
    cwd: nitro.options.output.publicDir,
    absolute: false,
    dot: true,
    ignore: [
      "_worker.js",
      "_worker.js.map",
      "nitro.json",
      ...explicitPublicAssets.map((dir) =>
        withoutLeadingSlash(joinURL(dir.baseURL, "**"))
      ),
    ],
  });
  routes.exclude.push(
    ...publicAssetFiles.map((i) => withLeadingSlash(i)).sort(comparePaths)
  );

  // Only allow 100 rules in total (include + exclude)
  routes.exclude.splice(100 - routes.include.length);

  await fsp.writeFile(
    resolve(nitro.options.output.publicDir, "_routes.json"),
    JSON.stringify(routes, undefined, 2)
  );
}

function comparePaths(a: string, b: string) {
  return a.split("/").length - b.split("/").length || a.localeCompare(b);
}
