import { defineEventHandler } from 'h3'

export default defineEventHandler(() => {
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
        <li>
          <a href="/api/test">/api/test</a>
        </li>
        <li>
          <a href="/api/cache">/api/cache</a>
        </li>
        <li>
          <a href="/api/error">/api/error</a>
        </li>
      </ul>
    </body>

</html>`
})
