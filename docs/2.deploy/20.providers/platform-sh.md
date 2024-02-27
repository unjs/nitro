# platform.sh

Run Nitro apps with [platform.sh](https://platform.sh).

# Configure
First, create a new project on platform.sh and link it to the repository you want to auto-deploy with. 

Then in repository create `.platform.app.yaml`:

## Normal

::alert{type="info"}
**Note:** This is a normal deploy that does not require additional functionalities such as filesystem.
::

```yaml
# Complete list of all available properties: https://docs.platform.sh/create-apps/app-reference.html

name: unjs-nitro
type: 'nodejs:18'

web:
  commands:
    start: "node .output/server/index.mjs"

variables:
  env:
    NUXT_TELEMETRY_DISABLED: 1

build:
  flavor: none

hooks:
  build: |
    corepack prepare pnpm@latest --activate
    corepack pnpm install
    corepack pnpm build

# Required for storage
# More info: https://unjs.io/blog/2023-08-25-nitro-2.6#default-persistent-data-storage
disk: 128
mounts:
    '.data':
        source: local
        source_path: .data
```

## Node.js Filesystem

::alert{type="info"}
**Note:** If you want to use the file system other than by default, you need to slightly modify the configuration file.
::

You need to add additional variable to: `mounts`.

On the example of using https://unstorage.unjs.io/drivers/fs#nodejs-filesystem

Edit `.nuxt.config.ts` and add:

```ts
	nitro: {
		storage: {
			newData: { driver: 'fs', base: 'storage' },
		},
	}
```

Then add:

```yaml
mounts:
    '.data':
        source: local
        source_path: .data
    'storage':
        source: local
        source_path: storage
```

To the recently created `.platform.app.yaml`.

::alert{type="warning"}
**Important:** The key and path name should match the one set in the `nuxt.config.ts` file.
::