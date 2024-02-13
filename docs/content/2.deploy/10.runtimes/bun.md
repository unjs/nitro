---
icon: simple-icons:bun

---

# Bun

Run Nitro apps with [Bun](https://bun.sh/) runtime.

**Preset:** `bun` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="warning"}
Bun preset is experimental and available to try via [edge channel](/guide/getting-started#nightly-release-channel).
::

## Building for Bun

After building with bun preset using `NITRO_PRESET=bun`, you can run the server in production using:

```bash
bun run ./.output/server/index.mjs
```

### Environment Variables

You can customize server behavior using following environment variables:

- `NITRO_PORT` or `PORT` (defaults to `3000`)
- `NITRO_UNIX_SOCKET` - if provided (a path to the desired socket file) the service will be served over the provided UNIX socket.
- `NITRO_UNIX_SOCKET_PERMISSION` - if provided (an octal number) the socket file will be updated with the provided permission.
