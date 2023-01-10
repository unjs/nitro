import { promises as fsp } from "node:fs";
import { resolve, dirname } from "pathe";
import type { PackageJson } from "pkg-types";
import { defineNitroPreset } from "../preset";

export const edgio = defineNitroPreset({
  extends: "node",
  commands: {
    deploy: "cd ./ && npm run edgio:deploy",
  },
  hooks: {
    async compiled(nitro) {
      // Write Edgio config, router, and connector files
      const edgioConfig = {
        connector: "./edgio",
        includeFiles: {
          [`${nitro.options.output.serverDir}/**/*`]: true,
        },
      };

      // .output/edgio.config.js
      const configPath = resolve(nitro.options.output.dir, "edgio.config.js");
      await writeFile(
        configPath,
        `module.exports = ${JSON.stringify(edgioConfig, null, 2)}`
      );

      // .output/routes.js
      const routerPath = resolve(nitro.options.output.dir, "routes.js");
      await writeFile(
        routerPath,
        routesTemplate(nitro.options.output.publicDir)
      );

      // .output/edgio/prod.js
      const edgioServerlessPath = resolve(
        nitro.options.output.dir,
        "edgio",
        "prod.js"
      );
      await writeFile(
        edgioServerlessPath,
        serverlessTemplate(nitro.options.output.serverDir)
      );

      // .output/package.json
      const pkgJSON: PackageJson & { scripts: Record<string, string> } = {
        private: true,
        scripts: {
          "edgio:dev": "edgio dev",
          "edgio:build": "edgio build",
          "edgio:deploy": "edgio deploy",
          "edgio:preview": "edgio build && edgio run --production",
        },
        devDependencies: {
          "@edgio/cli": "^6",
          "@edgio/core": "^6",
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

function routesTemplate(publicDir) {
  return `
import { Router } from '@edgio/core/router'
import { isProductionBuild } from '@edgio/core/environment'

const router = new Router()

if (isProductionBuild()) {
  router.static('${publicDir}')
}

router.fallback(({ renderWithApp }) => { renderWithApp() })

export defaulr router
`.trim();
}

function serverlessTemplate(serverDir) {
  return `
import { join } from 'path'
import { existsSync } from 'fs'

module.exports = async (port) => {
  const appFilePath = join(process.cwd(), ${serverDir})
  // If ${serverDir}/index.mjs exist, run it
  if (existsSync(appFilePath)) {
    // Set the NITRO_PORT per
    // https://github.com/nuxt/framework/discussions/4972#:~:text=the%20PORT%20or-,NITRO_PORT,-environment%20variables
    process.env.NITRO_PORT = port.toString()
    await import(appFilePath)
  }
}
`.trim();
}
