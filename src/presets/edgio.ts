import { promises as fsp } from "node:fs";
import { resolve, dirname } from "pathe";
import type { PackageJson } from "pkg-types";
import { defineNitroPreset } from "../preset";

export const edgio = defineNitroPreset({
  extends: "node",
  commands: {
    deploy: "cd ./ && npm run edgio:deploy",
    preview: "cd ./ && npm run edgio:preview",
  },
  hooks: {
    async compiled(nitro) {
      // Write Edgio config, router, and connector files
      const edgioConfig = {
        connector: "@edgio/nitropack",
      };
      const configPath = resolve(nitro.options.output.dir, "edgio.config.js");
      await writeFile(
        configPath,
        `module.exports = ${JSON.stringify(edgioConfig, null, 2)}`
      );

      const routerPath = resolve(nitro.options.output.dir, "routes.js");
      await writeFile(routerPath, routesTemplate());

      const pkgJSON: PackageJson & { scripts: Record<string, string> } = {
        private: true,
        scripts: {
          "edgio:dev": "edgio dev",
          "edgio:build": "edgio build",
          "edgio:deploy": "edgio deploy",
          "edgio:preview": "edgio build && edgio run --production",
        },
        devDependencies: {
          "@edgio/cli": "latest",
          "@edgio/core": "latest",
          "@edgio/nitropack": "latest",
        },
      };
      await writeFile(
        resolve(nitro.options.output.dir, "package.json"),
        JSON.stringify(pkgJSON, null, 2)
      );
    },
  },
});

async function writeFile(path: string, contents: string) {
  await fsp.mkdir(dirname(path), { recursive: true });
  await fsp.writeFile(path, contents, "utf8");
}

// Edgio router (.output/routes.js)
function routesTemplate() {
  return `
import { Router } from '@edgio/core/router'
import { nitropackRoutes } from '@edgio/nitropack'

export default new Router().use(nitropackRoutes)
`.trim();
}
