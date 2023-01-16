import { promises as fsp, existsSync } from "node:fs";
import { resolve, dirname } from "pathe";
import { addDependency } from "nypm";
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

      // rootDir/edgio.config.js
      const gitIgnorePath = resolve(nitro.options.rootDir, ".gitignore");
      if (existsSync(gitIgnorePath)) {
        const gitIgnoreContent = await fsp.readFile(gitIgnorePath, "utf8");
        if (!gitIgnoreContent.includes(".edgio")) {
          await fsp.appendFile(
            resolve(nitro.options.rootDir, ".gitignore"),
            "\n# Edgio specific directory\n.edgio\n",
            "utf8"
          );
        }
        if (!gitIgnoreContent.includes(".edgio_temp")) {
          await fsp.appendFile(
            resolve(nitro.options.rootDir, ".gitignore"),
            "\n# Edgio specific directory\n.edgio_temp\n",
            "utf8"
          );
        }
        if (!gitIgnoreContent.includes("edgio.config.js")) {
          await fsp.appendFile(
            resolve(nitro.options.rootDir, ".gitignore"),
            "\n# Edgio specific file\nedgio.config.js\n",
            "utf8"
          );
        }
      }

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
      if (!existsSync(configPath)) {
        await writeFile(
          configPath,
          `module.exports = ${JSON.stringify(edgioConfig, null, 2)}`
        );
      }

      // rootDir/.edgio_temp/routes.js
      const routerPath = resolve(nitro.options.output.dir, "routes.js");
      if (!existsSync(routerPath)) {
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
      `.trim()
        );
      }

      // rootDir/.edgio_temp/prod.js
      const edgioServerlessPath = resolve(nitro.options.output.dir, "prod.js");
      if (!existsSync(edgioServerlessPath)) {
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
      `.trim()
        );
      }

      // To use the Edgio CLI (via npx @edgio/cli or directly with edgio), the two packages need to be installed in the rootDir
      const edgioPackageJSON = resolve(nitro.options.rootDir, "package.json");
      if (!existsSync(edgioPackageJSON)) {
        await writeFile(
          edgioPackageJSON,
          `
{
  "name": "nitropack-edgio",
  "devDependencies": {
    "@edgio/cli": "^6",
    "@edgio/core": "^6"
  }
}
`.trim()
        );
      }
      await installEdgioDeps();
    },
  },
});

async function writeFile(path: string, contents: string) {
  await fsp.mkdir(dirname(path), { recursive: true });
  await fsp.writeFile(path, contents, "utf8");
}

async function installEdgioDeps() {
  console.log("> Installing Edgio devDependencies...\n");
  try {
    await addDependency("@edgio/core");
    await addDependency("@edgio/cli");
    console.log("> Installed Edgio devDependencies succesfully!\n");
  } catch (e) {
    console.log(
      "> Installing Edgio devDependencies failed with the following error:\n"
    );
    console.log(e.message || e.toString());
  }
}
