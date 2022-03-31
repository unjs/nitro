import { existsSync, promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import { prettyPath } from '../utils'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

export const browser = defineNitroPreset((_input) => {
  // TODO
  const baseURL = '/'

  const script = `<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('${joinURL(baseURL, 'sw.js')}');
  });
}
</script>`

  // TEMP FIX
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="prefetch" href="${joinURL(baseURL, 'sw.js')}">
  <link rel="prefetch" href="${joinURL(baseURL, '_server/index.mjs')}">
  <script>
  async function register () {
    const registration = await navigator.serviceWorker.register('${joinURL(baseURL, 'sw.js')}')
    await navigator.serviceWorker.ready
    registration.active.addEventListener('statechange', (event) => {
      if (event.target.state === 'activated') {
        window.location.reload()
      }
    })
  }
  if (location.hostname !== 'localhost' && location.protocol === 'http:') {
    location.replace(location.href.replace('http://', 'https://'))
  } else {
    register()
  }
  </script>
</head>

<body>
  Loading...
</body>

</html>`

  return {
    extends: 'worker',
    entry: '#nitro/entries/service-worker',
    output: {
      serverDir: '{{ output.dir }}/public/_server'
    },
    hooks: {
      'nitro:document' (tmpl) {
        tmpl.contents = tmpl.contents.replace('</body>', script + '</body>')
      },
      async 'nitro:compiled' (nitro: Nitro) {
        await fsp.writeFile(resolve(nitro.options.output.publicDir, 'sw.js'), `self.importScripts('${joinURL(baseURL, '_server/index.mjs')}');`, 'utf8')

        // Temp fix
        if (!existsSync(resolve(nitro.options.output.publicDir, 'index.html'))) {
          await fsp.writeFile(resolve(nitro.options.publicDir, 'index.html'), html, 'utf8')
        }
        if (!existsSync(resolve(nitro.options.publicDir, '200.html'))) {
          await fsp.writeFile(resolve(nitro.options.publicDir, '200.html'), html, 'utf8')
        }
        if (!existsSync(resolve(nitro.options.publicDir, '404.html'))) {
          await fsp.writeFile(resolve(nitro.options.publicDir, '404.html'), html, 'utf8')
        }
        nitro.logger.info('Ready to deploy to static hosting:', prettyPath(nitro.options.publicDir as string))
      }
    }
  }
})
