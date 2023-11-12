---
icon: simple-icons:deno
---

# Deno

Run Nitro apps with [Deno](https://deno.com/) runtime.

## Deno Server

**Preset:** `deno-server` ([switch to this preset](/deploy/#changing-the-deployment-preset))

::alert{type="warning"}
Deno runtime preset is experimental.
::

You can build your Nitro server using Node.js to run within [Deno Runtime](https://deno.com/runtime) in a custom server.

```bash
# Build with the deno NITRO preset
NITRO_PRESET=deno-server npm run build

# Start production server
deno run --unstable --allow-net --allow-read --allow-env .output/server/index.ts
```
