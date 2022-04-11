import { resolve } from 'path'
import { defineNitroPreset } from '../preset'
import { writeFile } from '../utils'

const entryTemplate = `
const http = require('http')

module.exports = async function prod(port) {
  const { handler } = await import('./index.mjs')
  const server = http.createServer(handler)
  server.listen(port)
}
`

export const layer0 = defineNitroPreset({
  extends: 'node',
  commands: {
    deploy: 'yarn layer0 deploy --skipFramework',
    preview: 'yarn layer0 run -p'
  },
  hooks: {
    async 'nitro:compiled' (nitro) {
      const entrtyPath = resolve(nitro.options.output.serverDir, 'prod.cjs')
      await writeFile(entrtyPath, entryTemplate)
    }
  }
})
