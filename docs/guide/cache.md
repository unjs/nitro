# Cache API

Nitro provides a powerful caching system built on top of the storage layer.

```js
import { defineCachedFunction } from '#nitro'
import { cachedEventHandler } from '#nitro'
```

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
const myFn = defineCachedFunction(async () => {
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
