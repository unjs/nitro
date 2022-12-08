import { promises as fsp } from "node:fs";
import { resolve, dirname } from "pathe";
import type { PackageJson } from "pkg-types";
import { defineNitroPreset } from "../preset";

export const layer0 = defineNitroPreset({
  extends: "node",
  commands: {
    deploy: "cd ./ && npm run deploy",
    preview: "cd ./ && npm run preview"
  },
  hooks: {
    async "compiled" (nitro) {
      // Write Layer0 config, router, and connector files
      const layer0Config = {
        connector: "./layer0",
        name: "nitro-app",
        routes: "routes.js",
        backends: {},
        includeFiles: {
          "public/**/*": true,
          "server/**/*": true
        }
      };
      const configPath = resolve(nitro.options.output.dir, "layer0.config.js");
      await writeFile(configPath, `module.exports = ${JSON.stringify(layer0Config, null, 2)}`);

      const routerPath = resolve(nitro.options.output.dir, "routes.js");
      await writeFile(routerPath, routesTemplate());

      const connectorPath = resolve(nitro.options.output.dir, "layer0/prod.js");
      await writeFile(connectorPath, entryTemplate());

      const pkgJSON: PackageJson & { scripts: Record<string, string> } = {
        private: true,
        scripts: {
          deploy: "npm install && 0 deploy",
          preview: "npm install && 0 build && 0 run -p"
        },
        devDependencies: {
          "@layer0/cli": "^4.13.2",
          "@layer0/core": "^4.13.2"
        }
      };
      await writeFile(resolve(nitro.options.output.dir, "package.json"), JSON.stringify(pkgJSON, null, 2));
    }
  }
});

async function writeFile (path: string, contents: string) {
  await fsp.mkdir(dirname(path), { recursive: true });
  await fsp.writeFile(path, contents, "utf8");
}

// Layer0 entrypoint (.output/layer0/prod.js)
function entryTemplate () {
  return `
const http = require('http')

module.exports = async function prod(port) {
  const { handler } = await import('../server/index.mjs')
  const server = http.createServer(handler)
  server.listen(port)
}
  `.trim();
}

// Layer0 router (.output/routes.js)
function routesTemplate () {
  return `
import { Router } from '@layer0/core'

const router = new Router()
export default router

router.fallback(({ renderWithApp }) => {
  renderWithApp()
})
`.trim();
}
