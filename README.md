# ⚗️Nitro

> Complete solution to build and deploy universal JavaScript web servers. Providing both build tooling and a runtime framework.

👉 **Rapid development** experience with hot module reloading

👉 **Multi provider** deployments with single codebase and zero configuration changes

👉 **Portable and compact** deployments without `node_modules` dependeny

👉 **Directory structure** aware to register api routes and more with zero configuration

👉 **Minimal Design** aiming to fit into any solution with minimum overhead

👉 **Code-splitting** and async chunk loading for fast server startup time

👉 **TypeScript** fully supported

👉 **Multi-driver storage** and caching layer

👉 **Route caching** and static **prerendering** with built-in crawler

👉 **Hackable** you can extend almost any part of nitro using options

👉 **Auto imports** for lazy folks and a tidy minimal codebase

👉 **Best-effort compatibility** for using legacy npm packages and mocking Node.js modules

Aren't you convinced yet? 😁 Maybe it there is already an [open issue](https://github.com/unjs/nitro/issues) in roadmap. No? [tell your ideas](https://github.com/unjs/nitro/discussions/new) then!


## ⚡️ Quick Start

Reading docs is boaring 😫 Let's get started with something working!

0️⃣ Create an empty directory `nitro-app`

```sh
mkdir nitro-app
cd nitro-app
```

1️⃣ Create `api/test.ts`:

```ts [api/test.ts]
export default () => 'Nitro is amazing!'
```

2️⃣ Start development server:

```sh
npx nitropack dev
```

🪄 Your API is ready at http://localhost:3000/api/test

**🤓 [TIP]** Check `.nitro/dev/index.mjs` if want to know what happened!

3️⃣ You can now build your production ready server:

```bash
npx nitropack build
````

4️⃣ Output is in `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

## Type Support

Nitro uses an special `#nitro` alias for runtime helpers. To add type support within your project,
you may add the following to your `tsconfig.json` file:

```json
"compilerOptions": {
  "paths": {
    "#nitro": ["nitropack/dist/runtime/index"]
  }
}
```

## API Routes

[ 🚧 TODO ]

## Routes Config

[ 🚧 TODO ]

## Storage

[ 🚧 TODO ]

## Caching

## Public Assets

[ 🚧 TODO ]

## Deployment Presets

[ 🚧 TODO ]

## 📚  Options

Who doesn't want having an option? Niro provides lots of them to customize any part of it's behavior!
In fact all deployment providers are built on the same options API!

Create a new `nitro.config.ts` file in order to provide options:

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
})
```

**🤓 [TIP]** Nitro handles configuration loading using [unjs/c12](https://github.com/unjs/c12). You have more advanced possibilities such as using `.env`. and `.nitrorc`.

### General

#### `preset`

Use `preset` option `NITRO_PRESET` environment variable for custom **production** preset.

Preset for development mode is always `dev` and by default `server` for production building an standalone Node.js server.

When `preset` option is not set and running in known environments, preset will be automatically detected!

Built-in presets: `azure_functions`, `azure`, `browser`, `cli`, `cloudflare`, `firebase`, `lambda`, `netlify`, `node`, `vercel`


#### `logLevel`

- Default: `3`

Log verbosity level. See [unjs/consola#level](https://github.com/unjs/consola/#level) for more information.

### App

#### `runtimeConfig`

- Default: `{}`

Server runtime configuration.

#### `app`

- Default: `{ baseURL: '/', cdnURL: undefined, buildAssetsDir: 'dist' }`

Runtime app configuration.


### Directories

#### `rootDir`

Project main directory

#### `srcDir`

Project source directory. Same as `rootDir` unless specified. Useful to move code into `src/`.

#### `scanDirs`

- Default: (source directory when empty array)

List of directories to scan and auto register files such as API routes.

#### `buildDir`

- Default: `.nitro`

Nitro's temporary working directory for generating build related files.

#### `output`

- Default: `{ dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }`

Output directories for production bundle.

### Features

#### `experimental`

- Default: `{}`

Enable experimental features. Currently non are available!

#### `storage`

- Default: `{ mounts: {} }`

Storage configuration.

#### `timing`

- Default: `false`

Enable timing information.

#### `renderer`

Path to main render (file should export an event handler as default)

#### `serveStatic`

- Default: `false`

Serve `public/` assets in production.

**Note:** It is highly recommended that your edge CDN (nginx, apache, cloud) serves `public/` directory instead.

#### `publicAssets`

Public asset directories to serve in development and bundle in production.

If a `public/` directory is detected, will be added by default but you can add more by yourself too!

#### `serverAssets`

Assets can be accessed in server logic and bundled in production.

#### `dev`

- Default: `true` for development and `false` for production.

You probably don't want to override it!

#### `devServer`

- Default: `{ watch: [] }`

Dev server options. You can use `watch` to make dev server reload if any file changes in specified paths.

#### `watchOptions`

Watch options for development mode. See [chokidar](https://github.com/paulmillr/chokidar) for more information.

#### `autoImport`

Auto import options. See [unjs/unimport](https://github.com/unjs/unimport) for more information.

### Routing

#### `handlers`

Server handlers and routes.

If `api/` and `middleware/` directories exist, they will be automatically added to the handlers array.

#### `devHandlers`

Normal handlers, each refer to the path of handler to be imported and transformed by rollup.

There are situations that we directly want to provide a handler instance with programmatic usage.

In this case we can use `devHandlers` but note that they are **only available in development mode** and **not in production build**.

#### `routes`

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

Prerenderer options. Any route specified will be fetched during build and copied to `.output/public` directory as an static asset.

If `crawlLinks` option is set to `true`, nitro starts with `/` by default (or all routes in `routes` array) and for HTML pages extracts `<a href="">` tags and prerender them as well.

### Rollup

**⚠️ Caution! Rollup options are considered advanced and things can go bad if misconfigured.** Nitro and presets provide best defaults.

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

Specify either build is used for Node.js or not. If set to `false`, Nitro tried to mock Node.js dependencies using [unjs/unenv](https://github.com/unjs/unenv) and adjust it's behavior.

#### `analyze`

If enabled, will analyze server bundle after build using [rollup-plugin-visualizer](https://github.com/btd/rollup-plugin-visualizer). You can also pass your custom options.

#### `moduleSideEffects`

Default: `[unenv/runtime/polyfill/]`

Rollup specific option. Specifis module imports that have side-effects

#### `replace`

Rollup specific option.

### Advanced

**⚠️ Caution! These options are considered advanced and things can go bad if misconfigured.** Nitro and presets provide best defaults.

#### `nodeModulesDirs`

Additional `node_modules` to search when resolving a module. By default user directory is added.

#### `hooks`

Nitro hooks. See [unjs/hookable](https://github.com/unjs/hookable) for more information.

#### `commands`

Preview and deploy command hints usually filled by deployment presets.

## 💻 Contribution

**Before everything, please make sure there is an option issue either confirming issue/bug 🐛 or you have an explicit👍 to go with adding an enhancenment or new feature. Thanks in advanced🙏**

- Fork and clone this repository
- Enable [corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `yarn install`
- Start playground with `yarn dev` and open http://localhost:3000
- Make changes
- Ensure all tests passing using `yarn test`
- Open that lovely PR!

## License

Made with 💛 Published under [MIT](./LICENSE).
