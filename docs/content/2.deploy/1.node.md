---
icon: akar-icons:node-fill
---

# Node.js

Node.js deployment is the default Nitro preset.

## Node.js Server

**Preset:** `node-server` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="info"}
**Default Preset**
:br
This is the default nitro output preset for production builds.
::


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
- `NITRO_HOST` or `HOST`
- `NITRO_UNIX_SOCKET` - if provided (a path to the desired socket file) the service will be served over the provided UNIX socket.
- `NITRO_SSL_CERT` and `NITRO_SSL_KEY` - if both are present, this will launch the server in HTTPS mode. In the vast majority of cases, this should not be used other than for testing, and the Nitro server should be run behind a reverse proxy like nginx or Cloudflare which terminates SSL.
- `NITRO_SHUTDOWN` - Enables the graceful shutdown feature when set to `'true'`. If it's set to `'false'`, the graceful shutdown is bypassed to speed up the development process. Defaults to `'false'`.
- `NITRO_SHUTDOWN_SIGNALS` - Allows you to specify which signals should be handled. Each signal should be separated with a space. Defaults to `'SIGINT SIGTERM'`.
- `NITRO_SHUTDOWN_TIMEOUT` - Sets the amount of time (in milliseconds) before a forced shutdown occurs. Defaults to `'30000'` milliseconds.
- `NITRO_SHUTDOWN_FORCE` - When set to true, it triggers `process.exit()` at the end of the shutdown process. If it's set to `'false'`, the process will simply let the event loop clear. Defaults to `'true'`.

## Cluster mode

**Preset:** `node-cluster` ([switch to this preset](/deploy/#changing-the-deployment-preset))

For more performance and leveraging multi core handling, you can use cluster preset.

### Environment Variables

In addition to `node-server` environment variables, you can customize behavior:

- `NITRO_CLUSTER_WORKERS`: Number of cluster workers (default is Number of available cpu cores)


## Handler (advanced)

**Preset:** `node` ([switch to this preset](/deploy/#changing-the-deployment-preset))

Nitro also has a more low-level preset that directly exports a function with `(req, res) => {}` signature usable for middleware and custom servers.

When running `nitro build` with the Node preset, the result will be an entry point exporting a function with the `(req, res) => {}` signature.

**Example:**

```js
import { createServer } from 'node:http'
import handler from './.output/server'

const server = createServer(handler)
server.listen(8080)
```
