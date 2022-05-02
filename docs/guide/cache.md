# Cache API

Nitro provides a powerful caching system built on top of the storage layer.

## Usage

```js
const cachedFn = cachedEventHandler(fn, options)
```

### Options

- `name`: Handler name. It will be guessed from function name if not provided and fallback to `_` otherwise.
- `group`: Part of cache name. Useful to organize cache storage.
- `getKey`: A function that accepts same arguments of normal function and should generate cache key. If not provided, a bult-in hash function will be used.
- `integrity`: A value that changing it, will invalidate all caches for function. By default will be computed from **function code**.
- `maxAge`: Maximum age that cache is valid in seconds. Default is `1` second.
- `swr`: Enable Stale-While-Revalidate behavior. Enabled by default.


## Examples

**Example:** Cache an API handler

```js
// routes/cached.ts
const myFn = cachedEventHandler(async () => {
  new Promise(resolve => setTimeout(resolve, 1000))
  return `Response generated at ${new Date().toISOString()}`
}, { swr: true })
```

**Example:** Cache a utility function

```js
// utils/index.ts
const myFn = cachedFunction(async () => {
  new Promise(resolve => setTimeout(resolve, 1000))
  return Math.random()
}, { swr: true })
```


**Example:** Enable Cache on a group of routes (**🧪 Experimental!**)

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  routes: {
    '/blog/**': { swr: true }
  }
})
```
