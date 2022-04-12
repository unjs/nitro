import { NitroErrorHandler } from '../types'

function errorHandler (error, event) {
  event.res.setHeader('Content-Type', 'text/html; charset=UTF-8')
  event.res.statusCode = 503
  event.res.statusMessage = 'Server Unavailable'

  let body
  let title
  if (error) {
    title = `${event.res.statusCode} ${event.res.statusMessage}`
    body = `<code><pre>${error.stack}</pre></code>`
  } else {
    title = 'Reloading server...'
    body = '<progress></progress><script>document.querySelector(\'progress\').indeterminate=true</script>'
  }

  event.res.end(`<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${error ? '' : '<meta http-equiv="refresh" content="2">'}
    <title>${title}</title>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico/css/pico.min.css">
  </head>
  <body>
    <main class="container">
      <article>
        <header>
          <h2>${title}</h2>
        </header>
        ${body}
        <footer>
          Check console logs for more information.
        </footer>
      </article>
  </main>
  </body>
</html>
`)
}

export default errorHandler as NitroErrorHandler
