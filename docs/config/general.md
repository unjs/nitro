# General

## `preset`

Use `preset` option `NITRO_PRESET` environment variable for custom **production** preset.

Preset for development mode is always `nitro-dev` and default `node-server` for production building a standalone Node.js server.

The preset will automatically be detected when the `preset` option is not set and running in known environments.

## `logLevel`

- Default: `3` (`1` when the testing environment is detected)

Log verbosity level. See [unjs/consola#level](https://github.com/unjs/consola/#level) for more information.

## `runtimeConfig`

- Default: `{ nitro: { ... }, ...yourOptions }`

Server runtime configuration.

**Note:**: `nitro` namespace is reserved.
