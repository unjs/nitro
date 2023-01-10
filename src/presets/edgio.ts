import { promises as fsp } from "node:fs";
import { resolve, dirname } from "pathe";
import { defineNitroPreset } from "../preset";

export const edgio = defineNitroPreset({
  extends: "node",
  output: {
    dir: "{{ rootDir }}/.edgio_temp",
    serverDir: "{{ output.dir }}/serverless",
    publicDir: "{{ output.dir }}/static",
  },
  commands: {
    deploy: "cd ./ && npx @edgio/cli deploy",
    preview: "cd ./ && npx @edgio/cli build && npx @edgio/cli run --production",
  },
  hooks: {
    async compiled(nitro) {
      // npx @edgio/cli dev, build and deploy will use the .edgio directory
      // Update .gitignore to have .edgio, .edgio_temp, edgio.config.js
      await fsp.appendFile(
        resolve(nitro.options.rootDir, ".gitignore"),
        "\n.edgio_temp\n.edgio\nedgio.config.js\n",
        "utf8"
      );

      // Write Edgio config at the rootDir, everything else goes to the .edgio_temp folder
      const edgioConfig = {
        connector: "./.edgio_temp",
        routes: "./.edgio_temp/routes.js",
        includeFiles: {
          ".edgio_temp/serverless": true,
        },
      };

      // rootDir/edgio.config.js
      const configPath = resolve(nitro.options.rootDir, "edgio.config.js");
      await writeFile(
        configPath,
        `module.exports = ${JSON.stringify(edgioConfig, null, 2)}`
      );

      // rootDir/.edgio_temp/routes.js
      const routerPath = resolve(nitro.options.output.dir, "routes.js");
      await writeFile(
        routerPath,
        `
      import { Router } from '@edgio/core/router'
      import { isProductionBuild } from '@edgio/core/environment'

      const router = new Router()

      if (isProductionBuild()) {
        router.static('.edgio_temp/static')
      }

      router.fallback(({ renderWithApp }) => { renderWithApp() })

      export defaulr router
      `
      );

      // rootDir/.edgio_temp/prod.js
      const edgioServerlessPath = resolve(nitro.options.output.dir, "prod.js");
      await writeFile(
        edgioServerlessPath,
        `
      import { join } from 'path'
      import { existsSync } from 'fs'

      module.exports = async (port) => {
        const appFilePath = join(process.cwd(), '.edgio_temp', 'serverless')
        // If .edgio_temp/serverless/index.mjs exist, run it
        if (existsSync(appFilePath)) {
          process.env.PORT = port.toString()
          // Set the NITRO_PORT per
          // https://github.com/nuxt/framework/discussions/4972#:~:text=the%20PORT%20or-,NITRO_PORT,-environment%20variables
          process.env.NITRO_PORT = port.toString()
          await import(appFilePath)
        }
      }
      `
      );
    },
  },
});

async function writeFile(path: string, contents: string) {
  await fsp.mkdir(dirname(path), { recursive: true });
  await fsp.writeFile(path, contents, "utf8");
}
