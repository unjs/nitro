import { eventHandler } from "h3";

// https://github.com/scalar/scalar

// Served as /_nitro/scalar
export default eventHandler((event) => {
  const title = "Nitro Scalar API Reference";

  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="description" content="${title}" />
        <title>${title}</title>
      </head>
      <body>
        <script
          id="api-reference"
          data-url="/_nitro/openapi.json"
          data-proxy-url="https://api.scalar.com/request-proxy"></script>
        <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
      </body>
    </html>`;
});

function html(str, ...args) {
  return String.raw(str, ...args);
}
