# Node.js Deployment

## Node.js Server

**Preset:** `node-server` ([swtich to this preset](/deploy/#changing-the-deployment-preset))

::: info Note
This is the default nitro output preset for production builds.
:::


Build project using nitro CLI:

```bash
nitro build
```

When running `nitro build` with the Node server preset, the result will be an entry point that launches a ready-to-run Node server. To try output:

```bash
$ node .output/server/index.mjs
Listening on http://localhost:3000
```

You can now deploy fully standalone `.output` directory to the hosting of your choice.

### Environment Variables

You can customize server behavior using following environment variables:

- `NITRO_PORT` or `PORT` (defaults to `3000`)
- `NITRO_HOST` or `HOST` (defaults to `'localhost'`)
- `NITRO_SSL_CERT` and `NITRO_SSL_KEY` - if both are present, this will launch the server in HTTPS mode. In the vast majority of cases, this should not be used other than for testing, and the Nitro server should be run behind a reverse proxy like nginx or Cloudflare which terminates SSL.


## Handler (advanced)

**Preset:** `node` ([swtich to this preset](/deploy/#changing-the-deployment-preset))

Nitro also has a more low-level preset that directly exports a function with `(req, res) => {}` signuture usable for middleware and custom servers.

When running `nitro build` with the Node preset, the result will be an entry point exporting a function with the `(req, res) => {}` signature.

**Example:**

```js
import { createServer } from 'node:http'
import handler from './.output/server'

const server = createServer(handler)
server.listen(8080)
```
