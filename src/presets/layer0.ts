import { resolve, join, relative } from 'path'
import fs from 'fs-extra'
import { defineNitroPreset } from '../preset'
import { writeFile } from '../utils'

// Layer0 entrypoint
const entryTemplate = outputDir => `
const http = require('http')

module.exports = async function prod(port) {
  const { handler } = await import('${outputDir}/index.mjs')
  const server = http.createServer(handler)
  server.listen(port)
}
`

// Layer0 config
const configFilename = 'layer0.config.js'
const configTemplate = ({ connectorPath, appName, includeDirs = [] }) => `
// This file was automatically added by Layer0.
// You should commit this file to source control.
module.exports = {
  connector: "${connectorPath}",

  // The name of the site in Layer0 to which this app should be deployed.
  name: '${appName}',

  // Overrides the default path to the routes file. The path should be relative to the root of your app.
  routes: '${routerFilename}',

  includeFiles: {
    ${includeDirs.map(
      (dir, idx) => (idx ? '\n\t\t' : '') + "'" + dir + "/**/*': true"
    )}
  },

  backends: {
    // origin: {
    //   // The domain name or IP address of the origin server
    //   domainOrIp: 'example.com',

    //   // When provided, the following value will be sent as the host header when connecting to the origin.
    //   // If omitted, the host header from the browser will be forwarded to the origin.
    //   hostHeader: 'example.com',

    //   // Uncomment the following line if TLS is not set up properly on the origin domain and you want to ignore TLS errors
    //   // disableCheckCert: true,

    //   // Overrides the default ports (80 for http and 443 for https) and instead use a specific port
    //   // when connecting to the origin
    //   // port: 1337,
    // },
  },

  // The name of the team in Layer0 to which this app should be deployed.
  // team: 'my-team-name',

  // The maximum number of URLs that will be concurrently prendered during deployment when static prerendering is enabled.
  // Defaults to 200, which is the maximum allowed value.
  // prerenderConcurrency: 200,

  // A list of glob patterns identifying which source files should be uploaded when running layer0 deploy --includeSources. This option
  // is primarily used to share source code with Layer0 support personnel for the purpose of debugging. If omitted,
  // layer0 deploy --includeSources will result in all files which are not gitignored being uploaded to Layer0.
  //
  // sources : [
  //   '**/*', // include all files
  //   '!(**/secrets/**/*)', // except everything in the secrets directory
  // ],

  // Set to true to include all packages listed in the dependencies property of package.json when deploying to Layer0.
  // This option generally isn't needed as Layer0 automatically includes all modules imported by your code in the bundle that
  // is uploaded during deployment
  //
  // includeNodeModules: true,
};
`

// Layer0 router
const routerFilename = 'routes.js'
const routerTemplate = `
import { Router } from '@layer0/core'

export default new Router()
  // See https://docs.layer0.co/guides/routing for configuring additional routes

  .fallback(({ renderWithApp }) => {
    renderWithApp()
  })
`

export const layer0 = defineNitroPreset({
  extends: 'node',
  commands: {
    deploy: 'layer0 deploy',
    preview: 'layer0 build && layer0 run -p'
  },
  hooks: {
    async 'nitro:compiled' (nitro) {
      // nitro output paths
      const {
        output: { dir: outputDir, serverDir, ...outputDirs },
        rootDir
      } = nitro.options

      // relative output paths for Layer0 assets
      const connectorPathname = './layer0'
      const layer0OutputDir = outputDir
      const layer0EntryDir = resolve(layer0OutputDir, connectorPathname)
      const connectorPath = resolve(layer0EntryDir, 'prod.js')
      const configPath = resolve(layer0OutputDir, configFilename)
      const routerPath = resolve(layer0OutputDir, routerFilename)

      // package.json contents
      const packageJson = await fs.readJSON(join(rootDir, 'package.json'))

      // Layer0 app name
      const appName = packageJson.name || rootDir.split('/').reverse()[0]

      // write Layer0 config, router, and connector files
      await writeFile(
        configPath,
        configTemplate({
          connectorPath: connectorPathname,
          appName,
          includeDirs: Object.keys(outputDirs).map(dir =>
            relative(layer0OutputDir, outputDirs[dir])
          )
        })
      )
      await writeFile(routerPath, routerTemplate)
      await writeFile(
        connectorPath,
        entryTemplate(relative(layer0EntryDir, serverDir))
      )

      // copy over app package.json necessary for `layer0 init`
      await fs.copyFile(
        join(rootDir, 'package.json'),
        join(layer0OutputDir, 'package.json')
      )
    }
  }
})
