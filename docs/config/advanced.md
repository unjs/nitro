# Advanced

**⚠️ Caution! These options are considered advanced, and things can go wrong if misconfigured.** nitro and presets provide the best defaults.

## `dev`

- Default: `true` for development and `false` for production.

You probably don't want to override it!

## `typescript`

Default: `{ generateTsConfig: true }`

## `nodeModulesDirs`

Additional `node_modules` to search when resolving a module. By default user directory is added.

## `hooks`

nitro hooks. See [unjs/hookable](https://github.com/unjs/hookable) for more information.

## `commands`

Preview and deploy command hints are usually filled by deployment presets.
