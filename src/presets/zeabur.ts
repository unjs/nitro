import fsp from "node:fs/promises";
import { dirname, relative, resolve } from "pathe";
import { writeFile } from "../utils";
import { defineNitroPreset } from "../preset";
import type { Nitro } from "../types";

// https://zeabur.com/docs/advanced/serverless-output-format

export const zeabur = defineNitroPreset({
  extends: "node",
  entry: "#internal/nitro/entries/zeabur",
  output: {
    dir: "{{ rootDir }}/.zeabur/output",
    serverDir: "{{ output.dir }}/functions/__nitro.func",
    publicDir: "{{ output.dir }}/static",
  },
  commands: {
    deploy: "",
    preview: "",
  },
  hooks: {
    async compiled(nitro: Nitro) {
      const buildConfigPath = resolve(nitro.options.output.dir, "config.json");
      const cfg = {
        containerized: false,
        routes: [{ src: ".*", dest: "/__nitro" }],
      };
      await writeFile(buildConfigPath, JSON.stringify(cfg, null, 2));

      // Write ISR functions
      for (const [key, value] of Object.entries(nitro.options.routeRules)) {
        if (!value.isr) {
          continue;
        }
        const funcPrefix = resolve(nitro.options.output.serverDir, ".." + key);
        await fsp.mkdir(dirname(funcPrefix), { recursive: true });
        await fsp.symlink(
          "./" + relative(dirname(funcPrefix), nitro.options.output.serverDir),
          funcPrefix + ".func",
          "junction"
        );
        await writeFile(
          funcPrefix + ".prerender-config.json",
          JSON.stringify({ type: "Prerender" })
        );
      }
    },
  },
});
