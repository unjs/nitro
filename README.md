
[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![npm-edge version][npm-edge-version-src]][npm-edge-version-href]
[![npm-edge downloads][npm-edge-downloads-src]][npm-edge-downloads-href]
<!-- [![GitHub Actions][github-actions-src]][github-actions-href] [![Codecov][codecov-src]][codecov-href] -->

<h1 align="center">⚗️ Nitro</h1>
<p align="center">Build and deploy universal JavaScript servers!</p>

## Why using Nitro?

Nitro provides a powerful toolchain and a runtime framework from the [UnJS](https://github.com/unjs) ecosystem to build and deploy **any JavaScript server, anywhere!**

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

## Who is using Nitro?

[Nuxt 3](https://v3.nuxtjs.org/guide/concepts/server-engine) is using Nitro as it's server engine.

<br>
<hr>
<h3><a href="https://nitro.unjs.io">📖 Documentation</a></h3>
<h3><a href="https://github.com/unjs/nitro/blob/main/CHANGELOG.md">✍️ Changelog</a></h3>
<h3><a href="https://stackblitz.com/github/unjs/nitro/tree/main/examples/hello-world">🏀 Online playground</a></h3>
<hr>
<br>

<h2 align="center">😺 Quick Start</h2>

0️⃣ Create an empty directory `nitro-app`

```bash
mkdir nitro-app
cd nitro-app
```

1️⃣ Create `routes/index.ts`:

```ts [routes/index.ts]
export default () => 'nitro is amazing!'
```

2️⃣ Start development server:

```bash
npx nitropack dev
```

🪄 Your API is ready at `http://localhost:3000/`

**🤓 [TIP]** Check `.nitro/dev/index.mjs` if want to know what is happening

3️⃣ You can now build your production-ready server:

```bash
npx nitropack build
````

4️⃣ Output is in the `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

That's it you got it! Read the [documentation](https://nitro.unjs.io) to learn more.



```json
{
  "extends": "./.nitro/types/tsconfig.json"
}
```

## API Routes

API files inside `api/` directory will be automatically mapped to API routes and served using [h3](https://github.com/unjs/h3) router.

**Example:** Simple API route

```js
// api/test.ts
import { eventHandler } from 'h3'

export default eventHandler(() => 'Hello World!')
```

**Example:** API route with params

```js
// api/hello/[name].ts
import { eventHandler } from 'h3'

export default eventHandler(event => `Hello ${event.params.name}!`)
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
// api/test.ts
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


**Example:** Enable cache on group of routes

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

Currently supported presets:

- `aws-lambda`
- `azure`, `azure-functions`
- `base-worker`
- `browser-worker`
- `cli`
- `cloudflare`
- `firebase`
- `layer0`
- `netlify`
- `nitro-dev`, `nitro-prerender`
- `node`, `node-server`, `node-cli`
- `vercel`

You can build nitro project against a specific preset using `NITRO_PRESET=name npx nitropack build`

<hr>
<h3 align="center">🌱 nitro is young and under development</h3>

Check [🐛 open issues](https://github.com/unjs/nitro/issues)  for the known issues and roadmap and tell us [💡your ideas](https://github.com/unjs/nitro/discussions/new)!
<hr>


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
