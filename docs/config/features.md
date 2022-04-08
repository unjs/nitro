# Features

## `experimental`

- Default: `{}`

Enable experimental features. Currently, non are available!

## `storage`

- Default: `{}`

Storage configuration.

## `timing`

- Default: `false`

Enable timing information.

## `renderer`

Path to main render (file should export an event handler as default)

## `serveStatic`

- Default: `false`

Serve `public/` assets in production.

**Note:** It is highly recommended that your edge CDN (nginx, apache, cloud) serves the `public/` directory instead.

## `publicAssets`

Public asset directories to serve in development and bundle in production.

If a `public/` directory is detected, it will be added by default, but you can add more by yourself too!

## `serverAssets`

Assets can be accessed in server logic and bundled in production.



## `devServer`

- Default: `{ watch: [] }`

Dev server options. You can use `watch` to make the dev server reload if any file changes in specified paths.

## `watchOptions`

Watch options for development mode. See [chokidar](https://github.com/paulmillr/chokidar) for more information.

## `autoImport`

Auto import options. See [unjs/unimport](https://github.com/unjs/unimport) for more information.

## `plugins`

- Default: `[]`

An array of paths to nitro plugins. They will be executed by order on the first initialization.

## `virtual`

- Default: `{}`

A map from dynamic virtual import names to their contents or an (async) function that returns it.

