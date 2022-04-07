
<h1 align="center">⚗️ nitro</h1>

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm-edge version][npm-edge-version-src]][npm-edge-version-href]
[![npm-edge downloads][npm-edge-downloads-src]][npm-edge-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href] [![Codecov][codecov-src]][codecov-href]


> Build and deploy universal javaScript servers

nitro provides a powerful build toolchain and a runtime framework from the [UnJS](https://github.com/unjs) ecosystem to develop and deploy any javaScript server, anywhere!

<hr>


<h3 align="center">🌱 nitro is young and under development</h3>

🐛 Check [open issues](https://github.com/unjs/nitro/issues) for roadmap and known issues.

🎁 [Contributions](#-contribution) are more than welcome to improve documentation.

💡 [Tell us your ideas](https://github.com/unjs/nitro/discussions/new)

🏀 [Online playground](https://stackblitz.com/github/unjs/nitro/tree/main/examples/hello-world) on StackBlitz
<hr>
<br>

 ❯ **Rapid development** experience with hot module replacement <br>
 ❯ **Multi-provider** deployments with a single codebase and zero-configuration<br>
 ❯ **Portable and compact** deployments without `node_modules` dependency <br>
 ❯ **Directory structure** aware to register API routes and more with zero configuration <br>
 ❯ **Minimal Design** to fit into any solution with minimum overhead <br>
 ❯ **Code-splitting** and async chunk loading for fast server startup time <br>
 ❯ **TypeScript** fully supported <br>
 ❯ **Multi-driver storage** and caching layer <br>
 ❯ **Route caching** and static **pre-rendering** with built-in crawler <br>
 ❯ **Hackable** to extend almost any part of nitro using options <br>
 ❯ **Auto imports** for lazy folks and a tidy minimal codebase <br>
 ❯ **Best-effort compatibility** for using legacy npm packages and mocking Node.js modules <br>

<hr>

## ⚡️ Quick Start

0️⃣ Create an empty directory `nitro-app`

```sh
mkdir nitro-app
cd nitro-app
```

1️⃣ Create `routes/index.ts`:

```ts [routes/index.ts]
export default () => 'nitro is amazing!'
```

2️⃣ Start development server:

```sh
npx nitropack dev
```

🪄 Your API is ready at http://localhost:3000/

**🤓 [TIP]** Check `.nitro/dev/index.mjs` if want to know what is happening

3️⃣ You can now build your production-ready server:

```bash
npx nitropack build
````

4️⃣ Output is in the `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

<hr>

## Typescript Support

nitro uses the `#nitro` alias for runtime helpers and global imports. To add type support within your project,
you should add the following to your `tsconfig.json` file:

```json
{
  "extends": "./.nitro/types/tsconfig.json"
}
```

## Routes and API Routes

Handler files inside `routes/` and `api/` directory will be automatically mapped to [unjs/h3](https://github.com/unjs/h3) routes.

**Note:** `api/` is a shortcut for `routes/api` as a common prefix. However please note that some deployment providers use `app/` directory for their API format. In this case, you can simply use `routes/api` or `srcDir` option to move everything under `src/` or `server/` directory.

**Example:** Simple API route

```js
// routes/test.ts
import { eventHandler } from 'h3'

export default eventHandler(() => 'Hello World!')
```

**Example:** API route with params

```js
// routes/hello/[name].ts
import { eventHandler } from 'h3'

export default eventHandler(event => `Hello ${event.context.params.name}!`)
```

## Storage

nitro provides a built-in storage layer using [unjs/unstorage](https://github.com/unjs/unstorage) that can abstract filesystem access.

```js
import { useStorage } from '#nitro'
```

ℹ️ See [unjs/unstorage](https://github.com/unjs/unstorage) for more usage information.

**Example:** Simple operations

```js
import { useStorage } from '#nitro'

await useStorage().setItem('test:foo', { hello: world })
await useStorage().getItem('test:foo')
```


By default storage is in-memory with mounted `cache:` prefix only for development.

You can add more mountpoints using `storage` option:

```js
// nitro.config.ts
import { definenitroConfig } from 'nitropack'

export default definenitroConfig({
  storage: {
    '/redis': {
      driver: 'redis',
      /* redis connector options */
    }
  }
})
```

## Cache API

nitro provides a powerful caching system built on top of storage layer.

```js
import { defineCachedFunction } from '#nitro'
import { cachedEventHandler } from '#nitro'
```

**Example:** Cache an API handler

```js
// routes/cached.ts
import { defineCachedFunction } from '#nitro'

const myFn = cachedEventHandler(async () => {
  new Promise(resolve => setTimeout(resolve, 1000))
  return `Response generated at ${new Date().toISOString()})`
}, { swr: true })
```

**Example:** Cache a utility function

```js
// utils/index.ts
import { defineCachedFunction } from '#nitro'

const myFn = defineCachedFunction(async () => {
  new Promise(resolve => setTimeout(resolve, 1000))
  return Math.random()
}, { swr: true })
```


**Example:** Enable cache on group of routes (**🧪 Experimental!**)

```js
// nitro.config.ts
import { definenitroConfig } from 'nitropack'

export default definenitroConfig({
  routes: {
    '/blog/**': { swr: true }
  }
})
```

## Public Assets

All assets in `public/` directory will be automatically served.

## Nitro plugins

In order to extend nitro's runtime behavior, we can register plugins.

They will be synchronously on first nitro initialization given `nitroApp` context which can be used to hook into lifecycle events.

**Example:** Simple plugin

```js
// plugins/test.ts
import { defineNitroPlugin } from '#nitro'

export default defineNitroPlugin((nitroApp) => {
  console.log('Nitro plugin', nitroApp)
})
```

```js
// nitro.config.ts
import { definenitroConfig } from 'nitropack'

export default definenitroConfig({
  plugins: [
    '~/plugins/test'
  ]
})
```

## Deployment Presets

Built-in presets:

- `aws-lambda`
- `azure`, `azure-functions` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/azure))
- `cli`
- `cloudflare` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/cloudflare))
- `firebase` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/firebase))
- `netlify` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/netlify))
- `nitro-dev`
- `nitro-prerender`
- `node`
- `node-server` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/presets/server))
- `node-cli`
- `service-worker`
- `vercel` ([deployment guide](https://v3.nuxtjs.org/guide/deployment/vercel))

You can build nitro project against a specific preset using `NITRO_PRESET=name npx nitropack build`

There is a demo repository for nitro deployments: https://github.com/unjs/nitro-deploys

<hr>

## 📚  Options

nitro provides lots of options them to customize any part of its behavior. It is powerful enough that all deployment providers are built on the exact options API.

Create a new `nitro.config.ts` file to provide options:

```js
// nitro.config.ts
import { definenitroConfig } from 'nitropack'

export default definenitroConfig({
})
```

**🤓 [TIP]** nitro handles configuration loading using [unjs/c12](https://github.com/unjs/c12). You have more advanced possibilities such as using `.env`. And `.nitrorc`.

### General

#### `preset`

Use `preset` option `NITRO_PRESET` environment variable for custom **production** preset.

Preset for development mode is always `nitro-dev` and default `node-server` for production building a standalone Node.js server.

The preset will automatically be detected when the `preset` option is not set and running in known environments.

#### `logLevel`

- Default: `3` (`1` when testing environment is detected)

Log verbosity level. See [unjs/consola#level](https://github.com/unjs/consola/#level) for more information.

#### `runtimeConfig`

- Default: `{ nitro: { ... }, ...yourOptions }`

Server runtime configuration.

**Note:**: `nitro` namespace is reserved.

### Directories

#### `rootDir`

Project main directory

#### `srcDir`

Project source directory. Same as `rootDir` unless specified. Helpful to move code into `src/`.

#### `scanDirs`

- Default: (source directory when empty array)

List of directories to scan and auto-register files, such as API routes.

#### `buildDir`

- Default: `.nitro`

nitro's temporary working directory for generating build-related files.

#### `output`

- Default: `{ dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }`

Output directories for production bundle.

### Features

#### `experimental`

- Default: `{}`

Enable experimental features. Currently, non are available!

#### `storage`

- Default: `{}`

Storage configuration.

#### `timing`

- Default: `false`

Enable timing information.

#### `renderer`

Path to main render (file should export an event handler as default)

#### `serveStatic`

- Default: `false`

Serve `public/` assets in production.

**Note:** It is highly recommended that your edge CDN (nginx, apache, cloud) serves the `public/` directory instead.

#### `publicAssets`

Public asset directories to serve in development and bundle in production.

If a `public/` directory is detected, it will be added by default, but you can add more by yourself too!

#### `serverAssets`

Assets can be accessed in server logic and bundled in production.

#### `dev`

- Default: `true` for development and `false` for production.

You probably don't want to override it!

#### `devServer`

- Default: `{ watch: [] }`

Dev server options. You can use `watch` to make the dev server reload if any file changes in specified paths.

#### `watchOptions`

Watch options for development mode. See [chokidar](https://github.com/paulmillr/chokidar) for more information.

#### `autoImport`

Auto import options. See [unjs/unimport](https://github.com/unjs/unimport) for more information.

#### `plugins`

- Default: `[]`

Array of paths to nitro plugins. They will be executed by order on first initialization.

### Routing

#### `baseURL`

Default: `/` (or `NITRO_APP_BASE_URL` environment variable if provided)

Server's main base URL.

#### `handlers`

Server handlers and routes.

If `routes/`, `api/` or `middleware/` directories exist, they will be automatically added to the handlers array.

#### `devHandlers`

Regular handlers refer to the path of handlers to be imported and transformed by rollup.

There are situations in that we directly want to provide a handler instance with programmatic usage.

We can use `devHandlers` but note that they are **only available in development mode** and **not in production build**.

#### `routes`

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

#### `prerenderer`

Default: `{ crawlLinks: false, routes: [] }`

Prerendered options. Any route specified will be fetched during the build and copied to the `.output/public` directory as a static asset.

If `crawlLinks` option is set to `true`, nitro starts with `/` by default (or all routes in `routes` array) and for HTML pages extracts `<a href="">` tags and prerender them as well.

### Rollup

**⚠️ Caution! Rollup options are considered advanced, and things can go wrong if misconfigured.** nitro and presets provide the best defaults.

#### `rollupConfig`

Additional rollup configuration.

#### `entry`

Rollup entry.

#### `unenv`

Options for [unjs/unenv](https://github.com/unjs/unenv/) preset.

#### `alias`

Rollup aliases options.

#### `minify`

- Default: `false`

Minify bundle.

#### `inlineDynamicImports`

Avoid creating chunks.

#### `sourceMap`

Enable source-map generation

#### `node`

Specify whether the build is used for Node.js or not. If set to `false`, nitro tried to mock Node.js dependencies using [unjs/unenv](https://github.com/unjs/unenv) and adjust its behavior.

#### `analyze`

If enabled, will analyze server bundle after build using [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). You can also pass your custom options.

#### `moduleSideEffects`

Default: `[unenv/runtime/polyfill/]`

Rollup specific option. Specifies module imports that have side-effects

#### `replace`

Rollup specific option.

### Advanced

**⚠️ Caution! These options are considered advanced, and things can go wrong if misconfigured.** nitro and presets provide the best defaults.

#### `typescript`

Default: `{ generateTsConfig: true }`

#### `nodeModulesDirs`

Additional `node_modules` to search when resolving a module. By default user directory is added.

#### `hooks`

nitro hooks. See [unjs/hookable](https://github.com/unjs/hookable) for more information.

#### `commands`

Preview and deploy command hints are usually filled by deployment presets.

<hr>

## 🎁 Contribution

**Before everything, please make sure there is an option issue either confirming issue/bug 🐛 or you have an explicit 👍 to add an enhancement or new feature. Thanks in advance 🙏**

- Fork and clone this repository
- Enable [corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `yarn install`
- Activate passive watcher using `yarn stub`
- Start playground with `yarn dev` and open http://localhost:3000
  - You can also try [`examples/`](./examples/) using `yarn example <name>` and `yarn example:build <name>`
- Make changes
- Ensure all tests pass using the `yarn test` command
- Open that lovely PR!

## License

Made with 💛 Published under [MIT](./LICENSE).

<!-- Badges -->
[npm-version-src]: https://flat.badgen.net/npm/v/nitropack?style=flat-square&label=stable
[npm-version-href]: https://npmjs.com/package/nitropack

[npm-downloads-src]: https://flat.badgen.net/npm/dm/nitropack?style=flat-square&label=stable
[npm-downloads-href]: https://npmjs.com/package/nitropack

[npm-edge-version-src]: https://flat.badgen.net/npm/v/nitropack-edge?style=flat-square&label=edge
[npm-edge-version-href]: https://npmjs.com/package/nitropack-edge

[npm-edge-downloads-src]: https://flat.badgen.net/npm/dm/nitropack-edge?style=flat-square&label=edge
[npm-edge-downloads-href]: https://npmjs.com/package/nitropack-edge

[github-actions-src]: https://flat.badgen.net/github/status/unjs/nitro?style=flat-square
[github-actions-href]: https://github.com/unjs/nitro/actions?query=workflow%3Aci

[codecov-src]: https://flat.badgen.net/codecov/c/gh/unjs/nitro/main?style=flat-square
[codecov-href]: https://codecov.io/gh/unjs/nitro
