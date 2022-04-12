# Configuration

In order to customize nitro's behavior, we create a file named `nitro.config.ts`.

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
})
```

## Config Reference

<!-- General -->


### `preset`

Use `preset` option `NITRO_PRESET` environment variable for custom **production** preset.

Preset for development mode is always `nitro-dev` and default `node-server` for production building a standalone Node.js server.

The preset will automatically be detected when the `preset` option is not set and running in known environments.

### `logLevel`

- Default: `3` (`1` when the testing environment is detected)

Log verbosity level. See [unjs/consola#level](https://github.com/unjs/consola/#level) for more information.

### `runtimeConfig`

- Default: `{ nitro: { ... }, ...yourOptions }`

Server runtime configuration.

**Note:**: `nitro` namespace is reserved.


<!-- Features -->

### `experimental`

- Default: `{}`

Enable experimental features. Currently, non are available!

### `storage`

- Default: `{}`

Storage configuration.

### `timing`

- Default: `false`

Enable timing information.

### `renderer`

Path to main render (file should export an event handler as default)

### `serveStatic`

- Default: `false`

Serve `public/` assets in production.

**Note:** It is highly recommended that your edge CDN (nginx, apache, cloud) serves the `public/` directory instead.

### `publicAssets`

Public asset directories to serve in development and bundle in production.

If a `public/` directory is detected, it will be added by default, but you can add more by yourself too!

### `serverAssets`

Assets can be accessed in server logic and bundled in production.



### `devServer`

- Default: `{ watch: [] }`

Dev server options. You can use `watch` to make the dev server reload if any file changes in specified paths.

### `watchOptions`

Watch options for development mode. See [chokidar](https://github.com/paulmillr/chokidar) for more information.

### `autoImport`

Auto import options. See [unjs/unimport](https://github.com/unjs/unimport) for more information.

### `plugins`

- Default: `[]`

An array of paths to nitro plugins. They will be executed by order on the first initialization.

### `virtual`

- Default: `{}`

A map from dynamic virtual import names to their contents or an (async) function that returns it.



<!-- Routing -->

### `baseURL`

Default: `/` (or `NITRO_APP_BASE_URL` environment variable if provided)

Server's main base URL.

### `handlers`

Server handlers and routes.

If `routes/`, `api/` or `middleware/` directories exist, they will be automatically added to the handlers array.

### `devHandlers`

Regular handlers refer to the path of handlers to be imported and transformed by rollup.

There are situations in that we directly want to provide a handler instance with programmatic usage.

We can use `devHandlers` but note that they are **only available in development mode** and **not in production build**.

### `errorHandler`

Path to a custom runtime error handler. Replacing nitro's built-in error page.

**Example:**

```js [nitro.config]
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  errorHandler: '~/error'
})
```

```js [error.ts]
import type { NitroErrorHandler } from 'nitropack'

export default <NitroErrorHandler> function (error, event) {
  event.res.end('[custom error handler] ' + error.stack)
}
```

### `routes`

**🧪 Experimental!**

Route options. It is a map from route pattern (following [unjs/radix3](https://github.com/unjs/radix3)) to options.

Example:

```js
{
  routes: {
    '/blog/**': { swr: true }
  }
}
```

### `prerenderer`

Default: `{ crawlLinks: false, routes: [] }`

Prerendered options. Any route specified will be fetched during the build and copied to the `.output/public` directory as a static asset.

If `crawlLinks` option is set to `true`, nitro starts with `/` by default (or all routes in `routes` array) and for HTML pages extracts `<a href="">` tags and prerender them as well.



<!-- Directories -->

### `rootDir`

Project main directory

### `srcDir`

Project source directory. Same as `rootDir` unless specified. Helpful to move code into `src/`.

### `scanDirs`

- Default: (source directory when empty array)

List of directories to scan and auto-register files, such as API routes.

### `buildDir`

- Default: `.nitro`

nitro's temporary working directory for generating build-related files.

### `output`

- Default: `{ dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }`

Output directories for production bundle.



<!-- Advanced -->

### `dev`

- Default: `true` for development and `false` for production.

**⚠️ Caution! This is an advanced configuration. things can go wrong if misconfigured.**

### `typescript`

Default: `{ generateTsConfig: true }`

### `nodeModulesDirs`

**⚠️ Caution! This is an advanced configuration. things can go wrong if misconfigured.**

Additional `node_modules` to search when resolving a module. By default user directory is added.

### `hooks`

**⚠️ Caution! This is an advanced configuration. things can go wrong if misconfigured.**

nitro hooks. See [unjs/hookable](https://github.com/unjs/hookable) for more information.

### `commands`

**⚠️ Caution! This is an advanced configuration. things can go wrong if misconfigured.**

Preview and deploy command hints are usually filled by deployment presets.

### `devErrorHandler`

**⚠️ Caution! This is an advanced configuration. things can go wrong if misconfigured.**

A custom error handler function for development errors.


<!-- Rollup -->

### `rollupConfig`

Additional rollup configuration.

### `entry`

Rollup entry.

### `unenv`

Options for [unjs/unenv](https://github.com/unjs/unenv/) preset.

### `alias`

Rollup aliases options.

### `minify`

- Default: `false`

Minify bundle.

### `inlineDynamicImports`

Avoid creating chunks.

### `sourceMap`

Enable source-map generation

### `node`

Specify whether the build is used for Node.js or not. If set to `false`, nitro tried to mock Node.js dependencies using [unjs/unenv](https://github.com/unjs/unenv) and adjust its behavior.

### `analyze`

If enabled, will analyze server bundle after build using [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). You can also pass your custom options.

### `moduleSideEffects`

Default: `[unenv/runtime/polyfill/]`

Rollup specific option. Specifies module imports that have side-effects

### `replace`

Rollup specific option.

