import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

function createVueApp () {
  return {
    data: () => ({ count: 1 }),
    template: `
      <h1>This page is rendered with Vue 3</h1>
      Counter: <button @click="count++">{{ count }}</button>
    `
  }
}

const htmlTemplate = vueHTML => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="icon" type="image/x-icon" href="/favicon.ico">
  <title>Nitro: Vue SSR Example</title>
</head>
<body>
  <div id="app">${vueHTML}</div>
  <script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
  <script>
    ${createVueApp.toString()}
    Vue.createApp(createVueApp()).mount('#app')
  </script>
</body>
</html>`

export default async () => {
  const app = createSSRApp(createVueApp())
  const vueHTML = await renderToString(app).catch(_err => `<!-- SSR Error: ${_err} -->`)
  return htmlTemplate(vueHTML)
}
