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
    deploy: 'layer0 command?',
    preview: 'node ./server/prod.cjs'
  },
  hooks: {
    async 'nitro:compiled' (nitro) {
      const entrtyPath = resolve(nitro.options.output.serverDir, 'prod.cjs')
      await writeFile(entrtyPath, entryTemplate)
    }
  }
})
