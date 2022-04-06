import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  const links = [
    '/api/hello/you',
    '/api/test',
    '/api/cache',
    '/api/error'
  ]
  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <title>Nitro Playground</title>
    </head>

    <body>
      <h1>Welcome to Nitro playground!</h1>
      <ul>
${links.map(link => `        <li><a href="${link}">${link}</a></li>`).join('\n')}
      </ul>
    </body>

</html>`
})
