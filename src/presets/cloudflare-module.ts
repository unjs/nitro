import { readFile } from "node:fs/promises";
import { resolve } from "pathe";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

export const cloudflareModule = defineNitroPreset({
  extends: "base-worker",
  entry: "#internal/nitro/entries/cloudflare-module",
  exportConditions: ["workerd"],
  commands: {
    preview: "npx wrangler dev ./server/index.mjs --site ./public --local",
    deploy: "npx wrangler deploy",
  },
  rollupConfig: {
    external: "__STATIC_CONTENT_MANIFEST",
    output: {
      format: "esm",
      exports: "named",
    },
  },
  hooks: {
    "rollup:before"(_nitro, rollupConfig) {
      if (process.env.NITRO_EXP_CLOUDFLARE_DYNAMIC_IMPORTS) {
        rollupConfig.output = {
          ...rollupConfig.output,
          inlineDynamicImports: false,
        };
      }
    },
    async compiled(nitro: Nitro) {
      await writeFile(
        resolve(nitro.options.output.dir, "package.json"),
        JSON.stringify({ private: true, main: "./server/index.mjs" }, null, 2)
      );
      await writeFile(
        resolve(nitro.options.output.dir, "package-lock.json"),
        JSON.stringify({ lockfileVersion: 1 }, null, 2)
      );
      const wranglerConfig = await readFile(
        resolve(nitro.options.rootDir, "wrangler.toml"),
        "utf8"
      ).catch(() => null);
      if (wranglerConfig && !wranglerConfig.includes("rules")) {
        console.warn(
          '[nitro] You now need to add a "rules" section to your wrangler.toml enabling dynamic imports on the Cloudflare Workers Module preset. Read more at https://nitro.unjs.io/deploy/providers/cloudflare#cloudflare-module-workers.'
        );
      }
    },
  },
});
