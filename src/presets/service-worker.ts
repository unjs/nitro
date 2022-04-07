import { existsSync, promises as fsp } from 'fs'
import { resolve } from 'pathe'
import { joinURL } from 'ufo'
import { defineNitroPreset } from '../preset'
import type { Nitro } from '../types'

// TODO
// const scriptTemplate = (baseURL = '/') => `
// <script>
// if ('serviceWorker' in navigator) {
//   window.addEventListener('load', function () {
//     navigator.serviceWorker.register('${joinURL(baseURL, 'sw.js')}');
//   });
// }
// </script>
// `

const htmlTemplate = (baseURL = '/') => `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <link rel="prefetch" href="${joinURL(baseURL, 'sw.js')}">
  <link rel="prefetch" href="${joinURL(baseURL, 'server/index.mjs')}">
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
  Initializing nitro service worker...
</body>
</html>`

export const serviceWorker = defineNitroPreset(() => {
  return {
    extends: 'base-worker',
    entry: '#nitro/entries/service-worker',
    output: {
      serverDir: '{{ output.dir }}/public/server'
    },
    commands: {
      preview: 'npx serve ./public'
    },
    hooks: {
      async 'nitro:compiled' (nitro: Nitro) {
        // Write sw.js file
        await fsp.writeFile(resolve(nitro.options.output.publicDir, 'sw.js'), `self.importScripts('${joinURL(nitro.options.baseURL, 'server/index.mjs')}');`, 'utf8')

        // Write fallback initializer files
        const html = htmlTemplate(nitro.options.baseURL)
        if (!existsSync(resolve(nitro.options.output.publicDir, 'index.html'))) {
          await fsp.writeFile(resolve(nitro.options.output.publicDir, 'index.html'), html, 'utf8')
        }
        if (!existsSync(resolve(nitro.options.output.publicDir, '200.html'))) {
          await fsp.writeFile(resolve(nitro.options.output.publicDir, '200.html'), html, 'utf8')
        }
        if (!existsSync(resolve(nitro.options.output.publicDir, '404.html'))) {
          await fsp.writeFile(resolve(nitro.options.output.publicDir, '404.html'), html, 'utf8')
        }
      }
    }
  }
})
