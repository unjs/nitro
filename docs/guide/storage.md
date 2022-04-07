# Storage Layer

Nitro provides a built-in storage layer that can abstract filesystem access by using [unjs/unstorage](https://github.com/unjs/unstorage).

```js
import { useStorage } from '#nitro'
```

ℹ️ See [unjs/unstorage](https://github.com/unjs/unstorage) for more usage information.

**Example:** Simple operations

```js
await useStorage().setItem('test:foo', { hello: world })
await useStorage().getItem('test:foo')
```


By default storage is in-memory with mounted `cache:` prefix only for development.

You can add more mountpoints using `storage` option:

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  storage: {
    '/redis': {
      driver: 'redis',
      /* redis connector options */
    }
  }
})
```
