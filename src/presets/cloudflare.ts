import { join, resolve } from "pathe";
import fse from "fs-extra";
import { joinURL, withLeadingSlash } from "ufo";
import { globby } from "globby";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const cloudflare = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/cloudflare",
  commands: {
    preview: "npx wrangler dev ./server/index.mjs --site ./public --local",
    deploy: "npx wrangler publish",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, "package.json"),
        JSON.stringify({ private: true, main: "./server/index.mjs" }, null, 2)
      );
      await writeFile(
        resolve(nitro.options.output.dir, "package-lock.json"),
        JSON.stringify({ lockfileVersion: 1 }, null, 2)
      );
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

export const cloudflarePages = defineNitroPreset({
  extends: "cloudflare",
  entry: "#internal/nitro/entries/cloudflare-pages",
  commands: {
    preview: "npx wrangler pages dev .output/public",
    deploy: "npx wrangler pages publish .output/public",
  },
  output: {
    serverDir: "{{ rootDir }}/functions",
  },
  alias: {
    // Hotfix: Cloudflare appends /index.html if mime is not found and things like ico are not in standard lite.js!
    // https://github.com/unjs/nitro/pull/933
    _mime: "mime/index.js",
  },
  rollupConfig: {
    output: {
      entryFileNames: "path.js",
      format: "esm",
    },
  },
  hooks: {
    async compiled(nitro: Nitro) {
      await fse.move(
        resolve(nitro.options.output.serverDir, "path.js"),
        resolve(nitro.options.output.serverDir, "[[path]].js")
      );
      await fse.move(
        resolve(nitro.options.output.serverDir, "path.js.map"),
        resolve(nitro.options.output.serverDir, "[[path]].js.map")
      );
      const routes: CloudflarePagesRoutes = {
        version: 1,
        include: ["/*"],
        exclude: [],
      };
      // Push prefixed static assets to exclude, for most reliability
      for (const path of nitro.options.publicAssets) {
        if (path.baseURL && path.baseURL !== "/") {
          routes.exclude.push(joinURL(path.baseURL, "*"));
        }
      }

      const publicAssetFiles = await globby("**", {
        cwd: nitro.options.output.publicDir,
        absolute: false,
        dot: true,
        ignore: [".output/**"], // TODO!
      });

      for (const file of publicAssetFiles) {
        if (routes.exclude.length < 99) {
          routes.exclude.push(withLeadingSlash(file));
        }
      }

      await fse.writeFile(
        resolve(nitro.options.output.publicDir, "_routes.json"),
        JSON.stringify(routes, undefined, 2)
      );
    },
  },
});
