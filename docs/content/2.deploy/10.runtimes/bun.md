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

After building with bun preset using `NITRO_PRESET=bun`, you can run server in production using:

```bash
bun run ./.output/server/index.mjs
```
