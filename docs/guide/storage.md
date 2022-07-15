# Storage Layer

Nitro provides a built-in storage layer that can abstract filesystem or database or any other data source access by using [unjs/unstorage](https://github.com/unjs/unstorage).

See [unjs/unstorage](https://github.com/unjs/unstorage) for more usage information.

**Example:** Simple operations

```js
await useStorage().setItem('test:foo', { hello: world })
await useStorage().getItem('test:foo')
```


## Defining Mountpoints

By default storage is in-memory with mounted `cache:` prefix only for development.

```js
await useStorage().setItem('cache:foo', { hello: world })
await useStorage().getItem('cache:foo')
```

You can mount other storage drivers through the nuxt config using the `storage` option: 

```js
// nitro.config.ts
import { defineNitroConfig } from 'nitropack'

export default defineNitroConfig({
  storage: {
    'redis': {
      driver: 'redis',
      /* redis connector options */
    },
    'db': { 
      driver: 'fs', 
      base: './data/db' 
    }
  }
})
```
```js
await useStorage().setItem('redis:foo', { hello: world })
await useStorage().getItem('redis:foo')
```

You can find the list of drivers [on the unstorage repository](https://github.com/unjs/unstorage#drivers).


## DevStorage 

You can use the `devStorage` key to overwrite the storage configuration during development.

```js
export default defineNitroConfig({
  // Production
  storage: {
    'db': {
      driver: 'redis',
      /* redis connector options */
    }
  }
  // Development
  devStorage: {
    'db': { 
      driver: 'fs', 
      base: './data/db' 
    }
  }
})
```
